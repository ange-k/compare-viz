/// <reference types="vite/client" />

/**
 * ベースパスを考慮してパスを解決する
 * GitHub Pagesなどでサブパスにデプロイされた場合に対応
 */
export function resolvePublicPath(path: string): string {
  // ViteのベースURLを取得（import.meta.env.BASE_URL）
  const base = import.meta.env.BASE_URL || '/'
  
  // パスが/で始まる場合は、ベースパスを付加
  if (path.startsWith('/')) {
    // baseが/で終わり、pathが/で始まる場合は重複を避ける
    return base.endsWith('/') ? base + path.slice(1) : base + path
  }
  
  // 相対パスの場合はそのまま返す
  return path
}