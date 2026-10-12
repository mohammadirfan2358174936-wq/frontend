import { describe, it, expect } from "vitest";
import { formatCurrency, priceLabel } from "@/utils/format";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

describe("Frontend Smoke Tests", () => {
  it("formats currency properly", () => {
    const formatted = formatCurrency(1499, "INR");
    expect(formatted).toContain("1,499");
  });

  it("returns Free for zero price", () => {
    expect(priceLabel(0)).toBe("Free");
    expect(priceLabel(500)).toContain("500");
  });

  it("handles auth store session states", () => {
    const auth = useAuthStore.getState();
    expect(auth.user).toBeNull();

    useAuthStore.setState({
      user: {
        id: 1,
        name: "Test Admin",
        email: "test@eventora.io",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      },
      status: "authenticated",
    });

    expect(useAuthStore.getState().user?.email).toBe("test@eventora.io");
    expect(useAuthStore.getState().status).toBe("authenticated");

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().status).toBe("anonymous");
  });

  it("pushes and dismisses toasts", () => {
    const toastState = useToastStore.getState();
    const id = toastState.success("Welcome", "Smoke test toast");

    const currentToasts = useToastStore.getState().toasts;
    expect(currentToasts.length).toBeGreaterThan(0);
    expect(currentToasts[currentToasts.length - 1].title).toBe("Welcome");

    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts.find((t) => t.id === id)).toBeUndefined();
  });
});
