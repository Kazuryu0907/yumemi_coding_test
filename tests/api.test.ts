import { beforeEach, describe, expect, test, vi } from "vitest";
import { fetch_population, fetch_prefectures } from "../src/api";
test("env test", () => {
  console.log(process.env.VITE_X_API_KEY);
  expect(process.env.VITE_X_API_KEY).toBeTruthy();
});
test("fetch_prefecturesのValidationテスト", async () => {
  const res = await fetch_prefectures();
  if (!res.success) {
    console.error(res.error);
  }
  expect(res.success).toBe(true);
});

test("fetch_populationのValidationテスト", async () => {
  const res = await fetch_population(1);
  if (!res.success) {
    console.error(res.error);
  }
  expect(res.success).toBe(true);
});

describe("fetchのMockテスト", () => {
  // 毎回Mock初期化
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("fetch_prefeturesの200以外のテスト", async () => {
    const mockResponse = async () => {
      return {
        status: 403,
        statusText: "Forbidden",
        text: () => "Forbidden",
      };
    };
    (global.fetch as any) = vi.fn().mockImplementation(mockResponse);
    const res = await fetch_prefectures();
    expect(res.success).toBe(false);
  });
  test("fetch_populationの200以外のテスト", async () => {
    const mockResponse = async () => {
      return {
        status: 403,
        statusText: "Forbidden",
        text: () => "Forbidden",
      };
    };
    (global.fetch as any) = vi.fn().mockImplementation(mockResponse);
    const res = await fetch_population(1);
    expect(res.success).toBe(false);
  });
});
