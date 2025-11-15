import { useEmployeeMutation } from '@/services/apiService';
import React, { useEffect } from 'react';

const PersonalDetails = ({ onNext }) => {
  const [employee, { isSuccess, isLoading, isError, data }] = useEmployeeMutation();

  const handleSubmit = () => {
    employee({
      body: {
        entityName: 'Employee',
        recordId: 'ed8896c3-ab5d-43ac-b132-ee746f7e50d3',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            FirstName: 'Tshwanelo',
            LastName: 'Bucibo',
            Email: 'bucibot@gmail.com',
            Mobile: '0726589446',
            Gender: '1',
            GenderId: '1',
            NextOfKinFullName: 'Morgan Riba',
            NextOfKinRelationship: 'patner',
            NextOfKinMobile: '0726589446',
            NextOfKinEmail: 'johndoe@gte.co.za',
          },
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      console.log('success');
      onNext();
    }
  }, [isSuccess]);
  return <div>PersonalDetails</div>;
};

export default PersonalDetails;
