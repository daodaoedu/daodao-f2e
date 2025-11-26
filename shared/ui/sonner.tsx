import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors={false}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-600',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700',
          error: 'group-[.toaster]:!bg-white group-[.toaster]:!text-gray-900 group-[.toaster]:!border-red-300',
          success: 'group-[.toaster]:!bg-white group-[.toaster]:!text-gray-900 group-[.toaster]:!border-green-300',
          warning: 'group-[.toaster]:!bg-white group-[.toaster]:!text-gray-900 group-[.toaster]:!border-yellow-300',
          info: 'group-[.toaster]:!bg-white group-[.toaster]:!text-gray-900 group-[.toaster]:!border-blue-300',
        },
        style: {
          zIndex: 9999,
          backgroundColor: 'white',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          ...props.toastOptions?.style,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
