import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/assets/logo-black.png';
import BgImage from '@/assets/video-bg.jpg';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCasesCreateMutation } from '@/services/apiService';
import { ButtonLoader } from '@/components/ui/button-loader';
import ApplicationSuccess from './SuccessCaseCreate';
import { showErrorToast } from '@/components/ErrorToast ';
import { MoveLeft } from 'lucide-react';

const userTypeOptions = [
  { value: '1064', label: 'Student' },
  { value: '1063', label: 'Accommodation Provider' },
];

export default function LogCaseForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: '',
    subject: '',
    userTypeId: '',
    agreedToPrivacy: false,
  });
  const [errors, setErrors] = useState({});

  const [casesCreate, { isLoading: isLoadingCreate, isSuccess: isSuccessCreate, data: dataCreate, isError, error }] =
    useCasesCreateMutation();

  const validate = (values) => {
    const errors = {};
    if (!values.firstName) errors.firstName = 'First name is required';
    if (!values.lastName) errors.lastName = 'Last name is required';
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    if (!values.message) errors.message = 'Message is required';
    if (!values.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (!values.userTypeId) errors.userTypeId = 'User type is required';
    if (!values.subject) errors.subject = 'Subject is required';
    if (!values.agreedToPrivacy) errors.agreedToPrivacy = 'You must agree to the privacy policy';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        // First API call to create user
        const userResponse = await casesCreate({
          body: {
            entityName: 'Lead',
            requestName: 'UpsertRecordReq',
            inputParamters: {
              Entity: {
                Name: formData.firstName,
                Email: formData.email,
                Mobile: formData.phoneNumber,
                UserTypeId: parseInt(formData.userTypeId, 10),
              },
            },
          },
        }).unwrap();

        console;

        // Second API call to create case using the user ID from first response
        if (userResponse.UpsertResponse.recordId) {
          await casesCreate({
            body: {
              entityName: 'Cases',
              requestName: 'UpsertRecordReq',
              inputParamters: {
                Entity: {
                  Subject: formData.subject,
                  Description: formData.message,
                  CustomerId: userResponse.UpsertResponse.recordId,
                  CustomerIdObjectTypeCode: 'Lead',
                  ChannelId: '681',
                  CasesStatusId: '307',
                },
              },
            },
          }).unwrap();
        }
      } catch (error) {
        console.error('Error creating case:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      userTypeId: value,
    }));
  };

  if (isSuccessCreate) {
    return <ApplicationSuccess message={dataCreate?.clientMessage} isGeneralCase={true} />;
  }

  if (isError) {
    showErrorToast(error.data);
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="hidden md:block border-b bg-white border-orange-500">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <img src={Logo} alt="NSFAS Logo" className="h-12 cursor-pointer" onClick={() => navigate('/')} />
        </div>
      </nav>

      <div className="relative h-52 bg-orange-600 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-600/90">
          <img src={BgImage} alt="Background" className="w-full h-full object-cover mix-blend-overlay" />
        </div>

        <div className="relative px-6 py-6 max-w-7xl mx-auto">
          <div className="text-sm mb-2">Support</div>
          <h1 className="text-4xl font-bold mb-4">Log a case</h1>
          <p className="text-lg max-w-2xl">You can log a case about sign up, Login and password reset issues</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-10 pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-3 ">
            <Button variant={'link'} className="pl-0" onClick={() => navigate('/login')}>
              <MoveLeft /> Back
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">
              User Type <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleSelectChange} value={formData.userTypeId.toString()}>
              <SelectTrigger className={errors.userTypeId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select user type">
                  {userTypeOptions.find((opt) => opt.value === formData.userTypeId?.toString())?.label || 'Select user type'}
                </SelectValue>{' '}
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userTypeId && <p className="text-sm text-red-500">{errors.userTypeId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Phone number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="000 000 0000"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? 'border-red-500' : ''}
            />
            {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Leave us a message..."
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="privacy"
              name="agreedToPrivacy"
              checked={formData.agreedToPrivacy}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreedToPrivacy: checked }))}
            />
            <Label htmlFor="privacy" className="text-sm leading-none">
              You agree to our friendly{' '}
              <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                privacy policy
              </a>
              .
            </Label>
          </div>
          {errors.agreedToPrivacy && <p className="text-sm text-red-500">{errors.agreedToPrivacy}</p>}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
            {isLoadingCreate ? <ButtonLoader className="text-white" /> : 'Send message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
