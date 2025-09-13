import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: "A imagem deve ter no máximo 2MB.",
        });
        return null;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: "Apenas arquivos de imagem são permitidos.",
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Remove old avatar if exists
      await supabase.storage
        .from('avatars')
        .remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast({
        title: "Sucesso!",
        description: "Foto atualizada com sucesso.",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem.",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadAvatar, uploading };
};