import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  navSectionMap,
  useActiveSection,
} from "@/hooks/useActiveSection";

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

const observerInstances: ObserverInstance[] = [];

class MockIntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  readonly unobserve = vi.fn();
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: number[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observerInstances.push(this);
  }
}

afterEach(() => {
  observerInstances.length = 0;
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("useActiveSection", () => {
  it("defaults to hero and does not create an observer without sections", () => {
    const observer = vi.fn();
    vi.stubGlobal("IntersectionObserver", observer);

    const { result } = renderHook(() => useActiveSection());

    expect(result.current).toBe("hero");
    expect(observer).not.toHaveBeenCalled();
  });

  it("selects the intersecting section with the highest ratio", () => {
    document.body.innerHTML = `
      <section id="about"></section>
      <section id="projects"></section>
      <section id="contact"></section>
    `;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const { result, unmount } = renderHook(() => useActiveSection());
    const instance = observerInstances[0];
    const about = document.getElementById("about")!;
    const projects = document.getElementById("projects")!;
    const contact = document.getElementById("contact")!;

    expect(instance.observe).toHaveBeenCalledWith(about);
    expect(instance.observe).toHaveBeenCalledWith(projects);
    expect(instance.observe).toHaveBeenCalledWith(contact);

    act(() => {
      instance.callback(
        [
          { target: about, isIntersecting: true, intersectionRatio: 0.4 },
          { target: projects, isIntersecting: true, intersectionRatio: 0.8 },
          { target: contact, isIntersecting: false, intersectionRatio: 1 },
        ] as unknown as IntersectionObserverEntry[],
        instance as unknown as IntersectionObserver
      );
    });

    expect(result.current).toBe("projects");

    unmount();
    expect(instance.disconnect).toHaveBeenCalledOnce();
  });

  it("exposes the expected navigation-to-section mapping", () => {
    expect(navSectionMap).toEqual({
      work: "projects",
      about: "about",
      tech: "tech",
      timeline: "timeline",
      contact: "contact",
    });
  });
});
