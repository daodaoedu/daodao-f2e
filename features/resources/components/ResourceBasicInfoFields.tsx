'use client';

import { useFormContext } from 'react-hook-form';
import { Link2Icon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ResourceFormSchema } from '@/services/resources/core/schema';
import { Text, Title } from '@/components/ui/typography';
import { UploadImage } from '@/components/ui/upload-image';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

type ResourceBasicInfoSchema = Pick<
  ResourceFormSchema,
  'name' | 'url' | 'imageUrl' | 'description' | 'videoUrl'
>;

export default function ResourceBasicInfoFields() {
  const form = useFormContext<ResourceBasicInfoSchema>();

  return (
    <>
      <Title as="h2" size="lg" className="mb-2 text-center">
        主要資訊
      </Title>
      <Text size="lg" className="mb-10 text-center text-basic-500">
        填寫相關資訊幫助其他人了解這個資源
      </Text>

      <div className="space-y-10">
        <div className="flex gap-6">
          <div className="flex-[2]">
            <FormLabel required>封面圖</FormLabel>
            <UploadImage ratio={133 / 100}>
              <Plus size={24} />
              選擇封面
            </UploadImage>
          </div>

          <div className="flex-[5] space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>資源名稱</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="資源名稱，最少需填入 5 個字元"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>資源連結</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="請輸入以 https:// 開頭的網址"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>介紹</FormLabel>
              <FormControl>
                <MarkdownEditor
                  placeholder="請簡單介紹這個資源的特色和適合對象"
                  maxLength={999}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>介紹影片</FormLabel>
              <FormDescription>
                關於這個資源的相關影片，可提供您製作的影片、或是來自資源作者的內容
              </FormDescription>
              <div className="flex gap-4">
                <FormControl>
                  <Input
                    placeholder="複製 YouTube 影片網址"
                    prefixIcon={<Link2Icon />}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <Button type="button" variant="outline" size="lg">
                  <Plus size={15} />
                  嵌入
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
