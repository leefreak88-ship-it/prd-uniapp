import assert from "node:assert/strict";
import test from "node:test";
import { shouldStartCategoryBootstrap } from "../src/pages/home/hooks/useCategory";

test("shouldStartCategoryBootstrap 在未启动且未请求未完成时返回 true", () => {
  const result = shouldStartCategoryBootstrap({
    bootstrapFetchStarted: false,
    isFetching: false,
    isFetched: false,
  });
  assert.equal(result, true);
});

test("shouldStartCategoryBootstrap 在已启动时返回 false", () => {
  const result = shouldStartCategoryBootstrap({
    bootstrapFetchStarted: true,
    isFetching: false,
    isFetched: false,
  });
  assert.equal(result, false);
});

test("shouldStartCategoryBootstrap 在请求进行中时返回 false", () => {
  const result = shouldStartCategoryBootstrap({
    bootstrapFetchStarted: false,
    isFetching: true,
    isFetched: false,
  });
  assert.equal(result, false);
});

test("shouldStartCategoryBootstrap 在请求已完成时返回 false", () => {
  const result = shouldStartCategoryBootstrap({
    bootstrapFetchStarted: false,
    isFetching: false,
    isFetched: true,
  });
  assert.equal(result, false);
});
