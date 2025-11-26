# TailwindCSS 與 shadcn/ui 規範

- 樣式一律使用 Tailwind 類別，避免行內 `style`。條件類別請使用 `utils/cn.ts`。
- 優先使用 `components/ui/*`（shadcn/ui）作為基礎元件；擴充以組合方式完成，避免修改底層元件。
- class 管理：避免巢狀三元；以早返回或拆分變數維持可讀性。
- 可近用性：遵循 a11y 規範（聚焦、aria-*、Keyboard 操作）。
- 動畫與互動：優先使用 CSS 與 Tailwind Utilities，必要時再引入最小 JS。

參考：
- [tailwind.config.ts](mdc:tailwind.config.ts)
- [utils/cn.ts](mdc:utils/cn.ts)
- [components/ui](mdc:components/ui)


## 建議實務

- 將樣式分解為語意化變數，並使用 `cn` 合併：

```tsx
import { cn } from '@/utils/cn'

const base = 'inline-flex items-center justify-center rounded-md text-sm'
const tones = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
} as const

type Tone = keyof typeof tones

export const ButtonLike = ({ tone = 'primary', className, ...props }: { tone?: Tone } & React.ComponentProps<'button'>) => {
  return <button className={cn(base, tones[tone], className)} {...props} />
}
```

- shadcn 元件擴充以組合，不直接改動底層：

```tsx
import { Button } from '@/components/ui/button'

export const ConfirmButton = (props: React.ComponentProps<typeof Button>) => (
  <Button variant="destructive" {...props} />
)
```

