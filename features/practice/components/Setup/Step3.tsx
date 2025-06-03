import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/utils/cn';

interface Step3Props {
  handleNextStep: () => void;
  handlePrevStep?: () => void;
  validationErrors?: Record<string, string>;
  resources: Array<{id: number; name: string; url: string}>;
  newResourceName: string;
  newResourceUrl: string;
  setNewResourceName: (value: string) => void;
  setNewResourceUrl: (value: string) => void;
  addResource: () => void;
  removeResource: (id: number) => void;
}

const Step3: React.FC<Step3Props> = ({
  handleNextStep,
  handlePrevStep,
  validationErrors = {},
  resources,
  newResourceName,
  newResourceUrl,
  setNewResourceName,
  setNewResourceUrl,
  addResource,
  removeResource
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2 bg-primary" />
          <span className="text-sm text-muted-foreground">主題實踐</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground">實踐資源</h3>
        <p className="text-sm text-muted-foreground mt-1">
          新增實踐中可能會用的資源，例如書籍、Podcast或...
        </p>
      </div>

      <div className="p-6 pt-0">
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-sm font-medium text-foreground">添加資源</Label>
              <span className="text-xs text-muted-foreground">{resources.length}/5</span>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-xs font-medium text-foreground mb-2">
                  資源名稱 <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="例如：原子習慣、How to Learn Faster podcast"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  className={cn(validationErrors.resourceName && "border-destructive")}
                />
              </div>

              <div>
                <Label className="block text-xs font-medium text-foreground mb-2">
                  資源連結
                </Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  className={cn(validationErrors.resourceUrl && "border-destructive")}
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={addResource}
                  disabled={!newResourceName.trim() || resources.length >= 5}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加資源
                </Button>

                {validationErrors.resources && (
                  <p className="mt-2 text-sm text-destructive">{validationErrors.resources}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">已添加的資源</Label>

            {resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">{resource.name}</div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {resource.url}
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(resource.id)}
                      className="text-destructive hover:text-destructive ml-3 p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg border border-border">
                <p className="text-sm">尚未添加任何資源</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-sm text-center text-foreground">
              ✨你的資源分享將能幫助有相同興趣的島友們
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
        >
          上一步
        </Button>
        <Button
          onClick={handleNextStep}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default Step3;
