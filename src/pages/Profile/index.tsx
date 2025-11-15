import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Home, Building, ChevronDown } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { useSearchParams } from 'react-router-dom';

interface ProfileSetupProps {
  personName: string;
  onNext: () => void;
  onPrevious: () => void;
}

const ProfileSetup = ({ personName = 'John', onNext, onPrevious }: ProfileSetupProps) => {
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const entry = searchParams.get('type');

  return (
    <DashboardLayout>
      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto w-full px-4 mt-8">
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center">
            <div className="relative flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
              <span className="text-white">1</span>
            </div>
            <div className="flex-1 h-1 mx-0 bg-orange-500">
              <div className="w-0 h-full bg-orange-500"></div>
            </div>
            <div className="relative flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
              <span className="text-white">2</span>
            </div>
            <div className="flex-1 h-1 mx-0 bg-gray-200"></div>
            <div className="relative flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
              <span>3</span>
            </div>
            <div className="flex-1 h-1 mx-0 bg-gray-200"></div>
            <div className="relative flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
              <span>4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Complete your profile, {personName}</h1>
            <p className="text-gray-600 mt-2">
              Congratulations on signing up to the NSFAS portal. We require additional information to ensure that you're set up for the best
              experience regardless of your selected profile.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {entry !== 'p' && (
              <Card
                className={`relative cursor-pointer transition-all ${selectedType === 'student' ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setSelectedType('student')}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">I am a student</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        A student is someone who is enrolled with any tertiary or TVET institution.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {entry !== 's' && (
              <Card
                className={`relative cursor-pointer transition-all ${selectedType === 'accommodation' ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setSelectedType('accommodation')}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Home className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">I am an Accommodation Provider</h3>
                      <p className="text-sm text-gray-600 mt-1">Someone or an organisation that provides a place to stay for student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {entry !== 's' && (
              <Card
                className={`relative cursor-pointer transition-all md:col-span-2 ${
                  selectedType === 'institution' ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedType('institution')}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Building className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">I represent an Institution</h3>
                      <p className="text-sm text-gray-600 mt-1">Im in charge of the administrative functions of an institution.E</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button onClick={onNext} disabled={!selectedType} className="bg-orange-500 hover:bg-orange-600">
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSetup;
