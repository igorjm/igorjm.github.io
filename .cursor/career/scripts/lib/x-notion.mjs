import { envFlag } from "./x-paths.mjs";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/** Property names documented in notion-hub.md */
export const EXPECTED_NOTION_PROPERTIES = [
  "Name",
  "Date",
  "Platform",
  "Slot",
  "Type",
  "Status",
  "Text",
  "Language",
  "Inspiration",
  "Reference",
  "Media",
  "ImageStrategy",
  "PublishedURL",
  "ExternalID",
  "BriefingURL",
];

export function isNotionEnabled() {
  return (
    envFlag("NOTION_ENABLED", true) &&
    Boolean(process.env.NOTION_TOKEN?.trim()) &&
    Boolean(process.env.NOTION_DATABASE_ID?.trim())
  );
}

function getDatabaseId() {
  const id = process.env.NOTION_DATABASE_ID?.trim();
  if (!id) throw new Error("NOTION_DATABASE_ID is required");
  return id.replace(/-/g, "");
}

function formatId(id) {
  const clean = id.replace(/-/g, "");
  if (clean.length !== 32) return clean;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

async function notionFetchSafe(path, options = {}) {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) throw new Error("NOTION_TOKEN is required");

  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function diagnoseNotionConnection(rawId) {
  const id = rawId.replace(/-/g, "");

  const dbRes = await notionFetchSafe(`/databases/${id}`);
  if (dbRes.ok) {
    const title =
      dbRes.data.title?.map((t) => t.plain_text).join("") || "(untitled)";
    const schema = new Set(Object.keys(dbRes.data.properties ?? {}));
    const missing = missingExpectedProperties(schema);
    return { databaseOk: true, databaseTitle: title, schema, missing };
  }

  const pageRes = await notionFetchSafe(`/pages/${id}`);
  if (pageRes.ok) {
    const pageTitle =
      Object.values(pageRes.data.properties ?? {})
        .find((p) => p.type === "title")
        ?.title?.map((t) => t.plain_text)
        .join("") || "(untitled)";

    const blocksRes = await notionFetchSafe(`/blocks/${id}/children?page_size=100`);
    const childDatabases = (blocksRes.data.results ?? [])
      .filter((b) => b.type === "child_database")
      .map((b) => ({
        id: b.id,
        title: b.child_database?.title || "(database)",
      }));

    return {
      databaseOk: false,
      pageOk: true,
      pageTitle,
      childDatabases,
    };
  }

  const msg = dbRes.data?.message ?? pageRes.data?.message ?? "";
  const accessDenied =
    dbRes.status === 404 &&
    pageRes.status === 404 &&
    msg.toLowerCase().includes("shared");

  return {
    databaseOk: false,
    pageOk: false,
    accessDenied,
    error: msg || `HTTP ${dbRes.status}`,
  };
}

async function notionFetch(path, options = {}) {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) throw new Error("NOTION_TOKEN is required");

  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Notion API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export function richText(value) {
  if (!value) return { rich_text: [] };
  const text = String(value).slice(0, 2000);
  return {
    rich_text: [{ type: "text", text: { content: text } }],
  };
}

export function titleText(value) {
  const text = String(value).slice(0, 2000);
  return {
    title: [{ type: "text", text: { content: text } }],
  };
}

export function selectValue(name) {
  if (!name) return { select: null };
  return { select: { name: String(name) } };
}

export function dateValue(isoDate) {
  if (!isoDate) return { date: null };
  return { date: { start: String(isoDate).slice(0, 10) } };
}

export function urlValue(url) {
  if (!url) return { url: null };
  return { url: String(url) };
}

export async function getDatabaseProperties() {
  const databaseId = getDatabaseId();
  const data = await notionFetch(`/databases/${databaseId}`);
  return new Set(Object.keys(data.properties ?? {}));
}

function filterPropertiesToSchema(properties, schema) {
  const filtered = {};
  for (const [key, value] of Object.entries(properties)) {
    if (schema.has(key)) filtered[key] = value;
  }
  return filtered;
}

export function missingExpectedProperties(schema) {
  return EXPECTED_NOTION_PROPERTIES.filter((name) => !schema.has(name));
}

async function findPageByExternalId(externalId) {
  const databaseId = getDatabaseId();
  const data = await notionFetch(`/databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        property: "ExternalID",
        rich_text: { equals: externalId },
      },
      page_size: 1,
    }),
  });
  return data.results?.[0] ?? null;
}

export async function upsertPage({ externalId, properties }, schema) {
  const existing = await findPageByExternalId(externalId);
  const props = filterPropertiesToSchema(
    {
      ...properties,
      ExternalID: richText(externalId),
    },
    schema,
  );

  if (existing?.id) {
    await notionFetch(`/pages/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: props }),
    });
    return { pageId: existing.id, created: false };
  }

  const databaseId = getDatabaseId();
  const created = await notionFetch("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: props,
    }),
  });
  return { pageId: created.id, created: true };
}

export async function upsertPages(rows) {
  const schema = await getDatabaseProperties();
  const missing = missingExpectedProperties(schema);
  if (missing.length) {
    console.warn(
      `Notion DB missing columns (data skipped for these): ${missing.join(", ")}`,
    );
    console.warn("Add them per .cursor/career/content/notion-hub.md");
  }

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const result = await upsertPage(row, schema);
    if (result.created) created += 1;
    else updated += 1;
  }

  return { created, updated, total: rows.length };
}
