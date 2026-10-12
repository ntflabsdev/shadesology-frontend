import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const configFile = path.join(projectRoot, "payload.config.ts");
const importMapFile = path.join(projectRoot, "app", "(payload)", "admin", "importMap.js");
const workspaces = [
  { route: "/orders", name: "OrdersWorkspace" },
  { route: "/quotes", name: "QuotesWorkspace" },
  { route: "/leads", name: "LeadsWorkspace" },
  { route: "/installers", name: "InstallersWorkspace" },
  { route: "/crm", name: "CrmWorkspace" },
];
const detailViews = [
  { route: "/orders/:id", name: "OrderDetailWorkspace" },
  { route: "/quotes/:id", name: "QuoteDetailWorkspace" },
];

describe("Payload admin workspaces", () => {
  it("registers the required native staff workspace routes", () => {
    const configText = readFileSync(configFile, "utf8");
    for (const { route, name } of [...workspaces, ...detailViews]) {
      assert.match(configText, new RegExp(`Component:\\s*"@/payload/admin/workspaces/${name}"[\\s\\S]*?path:\\s*"${route}"`));
    }
  });

  it("resolves each custom view through Payload's generated import map", () => {
    const importMapText = readFileSync(importMapFile, "utf8");
    for (const { name } of [...workspaces, ...detailViews]) {
      const fullPath = path.join(projectRoot, "payload", "admin", "workspaces", `${name}.tsx`);
      assert.equal(existsSync(fullPath), true, `Missing workspace file: ${fullPath}`);
      assert.ok(importMapText.includes(`@/payload/admin/workspaces/${name}#default`), `Missing import-map entry for ${name}`);
      if (workspaces.some((workspace) => workspace.name === name)) {
        assert.match(readFileSync(fullPath, "utf8"), /<WorkspaceTemplate/);
      }
    }
  });

  it("wraps views in Payload's authenticated admin template", () => {
    const templatePath = path.join(projectRoot, "payload", "admin", "workspaces", "WorkspaceTemplate.tsx");
    const templateText = readFileSync(templatePath, "utf8");
    assert.match(templateText, /DefaultTemplate/);
    assert.match(templateText, /initPageResult\.req\.user/);
    assert.match(templateText, /initPageResult\.visibleEntities/);
    assert.match(templateText, /redirect\("\/admin\/login"\)/);
  });

  it("allows verified staff into Payload Admin without enabling duplicate user CRUD", () => {
    const collectionsText = readFileSync(path.join(projectRoot, "payload", "collections.ts"), "utf8");
    const usersConfig = collectionsText.match(/export const Users:[\s\S]*?(?=export const Media:)/)?.[0];
    assert.ok(usersConfig, "Missing Payload users collection configuration");
    assert.match(usersConfig, /admin:\s*canUseAdmin/);
    assert.match(usersConfig, /disableLocalStrategy:\s*true/);
    assert.match(usersConfig, /strategies:\s*\[\{\s*name:\s*"backend-staff"/);
    for (const operation of ["create", "update", "delete"]) {
      assert.match(usersConfig, new RegExp(`${operation}:\\s*\\(\\)\\s*=>\\s*false`));
    }
    assert.match(usersConfig, /read:\s*\(\{\s*req\s*\}\)\s*=>\s*\(isStaff\(req\.user\)\s*\?\s*\{\s*id:\s*\{\s*equals:\s*req\.user\.id\s*\}\s*\}\s*:\s*false\)/);
  });

  it("leaves the Payload admin catch-all as the sole owner of workspace URLs", () => {
    const storefrontAdmin = path.join(projectRoot, "app", "(storefront)", "admin");
    for (const { route } of workspaces) {
      const routeName = route.slice(1);
      assert.equal(
        existsSync(path.join(storefrontAdmin, routeName, "page.tsx")),
        false,
        `A storefront page is shadowing Payload's /admin${route} view`,
      );
    }
  });
});
