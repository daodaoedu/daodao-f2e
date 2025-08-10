import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import dayjs from 'dayjs';
import PostCard from '@/shared/components/Post/PostCard';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  projectNoteFormSchema,
  ProjectNoteFormSchema,
} from '@/services/projects';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import Image from '@/shared/components/Image';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import Upload, { ImageDataType } from '@/shared/components/Upload';

interface NoteFormProps {
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: ProjectNoteFormSchema;
  onSubmit: (data: ProjectNoteFormSchema) => void;
}

export default function NoteForm({
  projectTitle,
  week,
  createdAt,
  defaultValues,
  isLoading,
  onSubmit,
}: NoteFormProps) {
  const [images, setImages] = useState<ImageDataType[]>(
    () => defaultValues?.imgUrls?.map((imgUrl) => ({
      url: imgUrl,
      id: crypto.randomUUID(),
    })) ?? []
  );

  const methods = useForm({
    resolver: zodResolver(projectNoteFormSchema),
    defaultValues: {
      title: projectTitle,
      date: dayjs(createdAt || undefined).format('YYYY-MM-DD'),
      week,
      content: '',
      imgUrls: [],
      ...defaultValues,
    },
  });

  const handleImageChange = (files: ImageDataType[]) => {
    const updatedImages = [...images, ...files];
    if (updatedImages.length > 5) {
      toast.error('最多只能上傳5張圖片');
      return;
    }
    setImages(updatedImages);
  };

  const handleDeleteImage = (uuid: string) => {
    setImages(images.filter((img) => img.id !== uuid));
  };

  useEffect(() => {
    methods.setValue(
      'imgUrls',
      images
        .filter((image) => image.url.startsWith('http'))
        .map((image) => image.url)
    );
    methods.setValue(
      'imgFiles',
      images
        .filter((image): image is Required<ImageDataType> => !!image.file)
        .map((image) => image.file)
    );
  }, [methods.setValue, images]);

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PostCard className="p-0 md:p-0">
          <PostCard.Header
            title={methods.watch('title')}
            subtitle={`第${numberToChineseNumber(week)}週`}
            tag="便利貼"
            date={dayjs(createdAt).format('YYYY/MM/DD')}
            onTitleChange={(title) => methods.setValue('title', title || projectTitle)}
            isEditable
          />
        </PostCard>
        <MarkdownEditor
          rootClassName="p-px mb-2 bg-basic-200 rounded-md"
          className="bg-white rounded-md"
          editorClassName="min-h-80 max-w-full"
          ref={(element) => methods.register('content').ref(element)}
          value={methods.watch('content')}
          placeholder="請填寫便利貼內容"
          onChange={(markdown) => methods.setValue('content', markdown)}
        />
        <div className="px-2">
          {Array.isArray(images) &&
            images.map((image) => (
              <div key={image.id} className="relative group mb-4">
                <Image
                  src={image.url}
                  alt="preview"
                  width="100%"
                  height="300px"
                  className="object-contain"
                />
                <span className="absolute inset-0 bottom-1.5 group-hover:bg-basic-black/20 transition-colors rounded-lg" />
                <Button
                  variant="alert"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <X />
                </Button>
              </div>
            ))}
          <Upload variant="secondary" onChange={handleImageChange} multiple>
            加入圖片
          </Upload>
        </div>
        <div className="flex justify-end gap-5">
          <Button variant="default" type="submit" disabled={isLoading}>
            發布
          </Button>
        </div>
      </form>
    </Form>
  );
}
