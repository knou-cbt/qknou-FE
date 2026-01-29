import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // MSA 지향 모듈 구조 규칙
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // Rule 1: modules/*/model, modules/*/api, modules/*/lib에서 next/* import 금지
            // (ui는 web 전용이므로 허용)
            {
              group: ["next/*"],
              message:
                "modules/*/model, modules/*/api, modules/*/lib는 플랫폼 독립 코드입니다. next/* import를 사용할 수 없습니다.",
              from: "**/modules/*/model/**",
            },
            {
              group: ["next/*"],
              message:
                "modules/*/model, modules/*/api, modules/*/lib는 플랫폼 독립 코드입니다. next/* import를 사용할 수 없습니다.",
              from: "**/modules/*/api/**",
            },
            {
              group: ["next/*"],
              message:
                "modules/*/model, modules/*/api, modules/*/lib는 플랫폼 독립 코드입니다. next/* import를 사용할 수 없습니다.",
              from: "**/modules/*/lib/**",
            },
            // Rule 2: 외부(app/, shared/)에서 modules/<domain>의 내부 폴더 직접 import 금지
            {
              group: [
                "@/modules/*/api/**",
                "@/modules/*/model/**",
                "@/modules/*/lib/**",
                "@/modules/*/ui/**",
              ],
              message:
                "외부에서는 modules/<domain>/index.ts만 import 가능합니다. modules/<domain>/api, model, lib, ui를 직접 import할 수 없습니다.",
              from: ["**/app/**", "**/shared/**"],
            },
          ],
        },
      ],
    },
  },
  // modules/*/model, modules/*/api, modules/*/lib에 대한 특별 규칙 (next/* 금지 강화)
  {
    files: ["**/modules/*/model/**", "**/modules/*/api/**", "**/modules/*/lib/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next/*"],
              message:
                "이 파일은 플랫폼 독립 코드입니다. next/* import를 사용할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
  // app/, shared/에서 modules 내부 직접 import 금지 강화
  {
    files: ["**/app/**", "**/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/api/**",
                "@/modules/*/model/**",
                "@/modules/*/lib/**",
                "@/modules/*/ui/**",
              ],
              message:
                "외부에서는 modules/<domain>/index.ts만 import 가능합니다. modules/<domain>/api, model, lib, ui를 직접 import할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
  // modules 간 직접 참조 금지 (절대 경로로 다른 도메인 import 금지)
  // 주의: 같은 도메인 내부(상대 경로 ../model)는 허용됩니다
  {
    files: ["**/modules/**"],
    rules: {
      "no-restricted-imports": [
        "warn", // error 대신 warn으로 설정 (같은 도메인 내부 허용을 위해)
        {
          patterns: [
            {
              // 다른 도메인의 내부를 절대 경로로 직접 import하는 것 금지
              // 예: modules/exam/**에서 @/modules/auth/api/** import 금지
              // 단, 같은 도메인 내부(../model, ../api 등)는 상대 경로이므로 허용
              group: [
                "@/modules/*/api/**",
                "@/modules/*/model/**",
                "@/modules/*/lib/**",
                "@/modules/*/ui/**",
              ],
              message:
                "다른 도메인 간 직접 참조는 금지됩니다. modules/<domain>/index.ts를 통해서만 import하세요. 같은 도메인 내부는 상대 경로(../model)를 사용하세요.",
              from: "**/modules/**",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
