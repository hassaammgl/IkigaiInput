
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/store/auth';
import { useToast } from '@/hooks/useToast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  bucket?: string;
  accept?: string;
  maxSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImage,
  bucket = 'post-images',
  accept = 'image/*',
  maxSize = 5
}) => {
  const { user } = useAuth();
  const { success,error:err } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadImage = useCallback(async (file: File) => {
    if (!user) {
      err('Please sign in to upload images.');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      err(`Please select an image smaller than ${maxSize}MB.`);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onImageUploaded(data.publicUrl);
      
      success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      err('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [user, success,err, onImageUploaded, bucket, maxSize]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={currentImage}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload Image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop an image here, or click to select
              </p>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </span>
                </Button>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: {maxSize}MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;
