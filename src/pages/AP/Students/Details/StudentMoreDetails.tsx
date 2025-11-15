import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, GraduationCap, Users2, Building2 } from 'lucide-react';

const StudentDetailsView = ({ data }) => {
  if (data === null) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <User className="w-12 h-12 mx-auto text-gray-400" />
        </div>
        <p className="text-lg font-medium">No student data available</p>
      </div>
    );
  }

  const student = data;

  const InfoField = ({ label, value }) => (
    <div className="p-1 bg-white rounded-lg">
      <Label className="text-sm font-medium text-gray-500 mb-1 block">{label}</Label>
      <div className="text-base font-medium text-gray-900 break-words">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </div>
    </div>
  );

  return (
    <div className="w-[300px] sm:w-full mx-auto  ">
      <Tabs defaultValue="institution" className="w-full space-y-1">
        <TabsList className="mb-4 p-1 bg-white shadow-sm rounded-xl w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="institution"
            className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Institution Registration
          </TabsTrigger>
          <TabsTrigger
            value="course-details"
            className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Course Details
          </TabsTrigger>
          <TabsTrigger value="mother" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            Mother
          </TabsTrigger>
          <TabsTrigger value="father" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            Father
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course-details" className="space-y-1 ">
          <Card className="border ">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Current Course" value={student?.registration.currentCourse} />
                <InfoField label="Year" value={student?.registration.year} />
                <InfoField label="Application Type" value={student?.registration.applicationType} />
                <InfoField label="Student Type" value={student?.registration.studentType} />
                <InfoField label="Funding Bucket" value={student?.registration.fundingBucket} />
                <InfoField label="Status" value={student?.registration.status} />
                <InfoField label="Institution name" value={student?.registration?.institutionName} />
                <InfoField label="Student Number" value={student?.studentDetails.studentNumber} />
                <InfoField label="Student Email" value={student?.studentDetails.email} />
                <InfoField label="Process Cycle" value={student?.studentDetails.processCycle} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mother" className="space-y-1">
          <Card className="border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                <InfoField label="First Name" value={student?.mother?.firstName} />
                <InfoField label="Last Name" value={student?.mother?.lastName} />
                <InfoField label="Financially Dependant" value={student?.mother?.financiallyDependant} />
                <InfoField label="Employed" value={student?.mother?.employed} />
                <InfoField label="Status" value={student?.mother?.alive} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="father" className="space-y-1">
          <Card className="border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="First Name" value={student?.father?.firstName} />
                <InfoField label="Last Name" value={student?.father?.lastName} />
                <InfoField label="Financially Dependant" value={student?.father?.financiallyDependant} />
                <InfoField label="Employed" value={student?.father?.employed} />
                <InfoField label="Status" value={student?.father?.alive} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institution" className="space-y-1">
          <Card className="border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Years of Study" value={student?.institutionRegistrations?.yearsOfStudy} />
                <InfoField label="Course Name" value={student?.institutionRegistrations?.legacyQualificationDescription} />
                <InfoField label="Process Circle" value={student?.institutionRegistrations?.processCycle} />
                <InfoField label="Qualification" value={student?.institutionRegistrations?.legacyQualificationDescription} />
                <InfoField label="Qualification Code" value={student?.institutionRegistrations?.legacyQualificationCode} />
                <InfoField label="Number Of Subjects Enrolled" value={student?.institutionRegistrations?.numberOfSubjectsEnrolled} />
                <InfoField
                  label="Number Of Repeat Subjects Enrolled"
                  value={student?.institutionRegistrations?.numberOfRepeatSubjectsEnrolled}
                />
                <InfoField label="Primary Funder Name" value={student?.institutionRegistrations?.primaryFunderName} />
                <InfoField label="Registration Type" value={student?.institutionRegistrations?.registrationType} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetailsView;
