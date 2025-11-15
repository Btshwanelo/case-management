import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForcedActionUpsertMutation } from '@/services/apiService';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonLoader } from '@/components/ui/button-loader';
import { removeForcedAction } from '@/slices/forcedActionsSlice';

type PropOption = {
  label: string;
  value: string;
};

type PropActionAttributes = {
  label: string;
  schemaName: string;
  isDropdown: boolean;
  options: PropOption[] | null;
};

type PropForcedActionsModal = {
  icon: string | null;
  title: string;
  description: string;
  isRedirect: boolean;
  entity: string;
  actionAttributes: PropActionAttributes[] | null;
  url: string | null;
};

const ForcedActionsModal = ({ icon, title, description, isRedirect, entity, actionAttributes, url }: PropForcedActionsModal) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const [formState, setFormState] = useState<{ [key: string]: string }>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const [forcedActionUpsert, { isSuccess, isLoading, data }] = useForcedActionUpsertMutation();

  const handleInputChange = (schemaName: string, value: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [schemaName]: value,
    }));
    setFormErrors((prevState) => ({
      ...prevState,
      [schemaName]: '',
    }));
  };

  const validateForm = (): boolean => {
    let valid = true;
    const errors: { [key: string]: string } = {};

    if (actionAttributes != null) {
      actionAttributes.forEach((attr: any) => {
        if (!formState[attr.schemaName] || formState[attr.schemaName].trim() === '') {
          errors[attr.schemaName] = `${attr.label} is required.`;
          valid = false;
        }
      });
    }

    setFormErrors(errors);
    return valid;
  };

  const handleUpdate = () => {
    if (validateForm()) {
      forcedActionUpsert({
        body: {
          entityName: entity,
          recordId: userDetails?.supplierId || userDetails?.recordId,
          requestName: 'UpsertRecordReq',
          inputParamters: { Entity: formState },
        },
      });
    }
  };

  useEffect(() => {
    if (isSuccess && data?.isSuccess === true) {
      dispatch(removeForcedAction(0));
    }
  }, [isSuccess]);

  const renderFormFields = () => {
    if (!actionAttributes) return null;

    return actionAttributes.map((attr, index) => (
      <div key={index} className="grid gap-2 mb-4">
        <Label htmlFor={attr.schemaName}>{attr.label}</Label>
        {attr.isDropdown && attr.options ? (
          <Select value={formState[attr.schemaName] || ''} onValueChange={(value) => handleInputChange(attr.schemaName, value)}>
            <SelectTrigger id={attr.schemaName}>
              <SelectValue placeholder={`Select ${attr.label}`} />
            </SelectTrigger>
            <SelectContent>
              {attr.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={attr.schemaName}
            value={formState[attr.schemaName] || ''}
            onChange={(e) => handleInputChange(attr.schemaName, e.target.value)}
            placeholder={attr.label}
            className={cn(formErrors[attr.schemaName] && 'border-red-500')}
          />
        )}
        {formErrors[attr.schemaName] && <p className="text-sm text-red-500">{formErrors[attr.schemaName]}</p>}
      </div>
    ));
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px] " aria-hidden="true" />

      <Dialog open={open}>
        <DialogContent className="space-y-8" showClose={false}>
          <DialogHeader className="space-y-4">
            <div className="w-12 h-12 rounded-md bg-orange-200  flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-orange-500" />
            </div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {!isRedirect && <div className="py-4">{renderFormFields()}</div>}

          <DialogFooter>
            {isRedirect ? (
              <Button
                className="w-full"
                onClick={() => {
                  navigate(`${url}?tag=${title}` || '/');
                  setOpen(false);
                }}
              >
                Redirect
              </Button>
            ) : (
              <Button className="w-full" onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? <ButtonLoader size="large" className="text-white" /> : 'Update'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ForcedActionsModal;
