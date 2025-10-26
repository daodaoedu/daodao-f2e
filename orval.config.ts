import { defineConfig } from "orval";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

export default defineConfig({
  client: {
    input: {
      target: "./services/openapi.yaml",
    },
    output: {
      mode: "tags",
      client: "swr",
      target: "generated/api",
      schemas: "generated/models",
      clean: true,
      fileExtension: ".client.ts",
      override: {
        mutator: {
          path: "shared/api/client-fetcher.ts",
          name: "clientFetcher",
        },
      },
    },
  },
  server: {
    input: {
      target: "./services/openapi.yaml",
    },
    output: {
      mode: "tags",
      client: "swr",
      fileExtension: ".server.ts",
      target: "generated/api",
      schemas: "generated/models",
      override: {
        mutator: {
          path: "shared/api/server-fetcher.ts",
          name: "serverFetcher",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: () => {
        // 處理 server 端文件，移除 hooks 但保留 keys 和 API 函數
        try {
          const apiDir = "generated/api";
          const files = readdirSync(apiDir);
          const serverFiles = files.filter((file: string) => file.endsWith(".server.ts"));
          
          serverFiles.forEach((fileName: string) => {
            const filePath = join(apiDir, fileName);
            const content = readFileSync(filePath, "utf-8");
            
            // 移除 SWR hooks 相關的 import
            let transformedContent = content
              .replace("import useSwr from 'swr';", '')
              .replace("import useSWRMutation from 'swr/mutation';", '')
              .replace("\n  SWRConfiguration", '')
              .replace("import type {\n  SWRMutationConfiguration\n} from 'swr/mutation';", '');
            
            // 移除 hook 函數定義 (以 use 開頭的函數)
            transformedContent = transformedContent
              .replace(/export\s+const\s+use[A-Z][a-zA-Z0-9]*\s*=[\s\S]*?(?=\nexport|\n$|$)/g, '');
            
            // 移除多餘的空行
            transformedContent = transformedContent
              .replace(/\n\s*\n\s*\n/g, '\n\n');
            
            writeFileSync(filePath, transformedContent);
          });
        } catch (error) {
          console.log("Server files processing skipped:", error);
        }
      },
    },
  },
});
