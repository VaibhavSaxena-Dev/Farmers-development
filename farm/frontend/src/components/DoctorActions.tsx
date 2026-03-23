import React, { useState } from 'react';
import { doctorApi } from '@/Backend/api/medicalApi';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DoctorActionsProps {
  doctorId: string;
  onDeleted?: () => void;
  onEdit?: () => void;
}

export const DoctorActions: React.FC<DoctorActionsProps> = ({ doctorId, onDeleted, onEdit }) => {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Delete this doctor?')) return;
    setDeleting(true);
    try {
      await doctorApi.deleteDoctor(doctorId);
      toast({ title: 'Deleted successfully' });
      onDeleted?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {onEdit && <Button size="sm" variant="outline" onClick={onEdit}><Edit className="h-4 w-4" /></Button>}
      <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
