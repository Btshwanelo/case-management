import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, CloudyIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetStudentApplicationsMutation } from "@/services/apiService";

const NotFound = () => {
  const navigate = useNavigate();

  const [getStudentApplications, { data, isLoading, isError, error }] =
    useGetStudentApplicationsMutation();

  useEffect(() => {
    const fetchData = async () => {
      await getStudentApplications({
        body: {
          entityName: "Facility",
          requestName: "AccommodationListingReq",
          inputParamters: {
            AccommodationProviderId: "257c1e9d-67c7-4f42-888e-042d94cbdee",
            Filters: [],
            SearchText: "",
            PageNumber: 1,
            PageSize: 12,
            Status: "",
          },
        },
      });
    };

    fetchData();
  }, [getStudentApplications]);

  const summary = data?.Summary || {};
  const listings = data?.listing || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="h-14 w-14 rounded-md border shadow-md flex items-center justify-center mx-auto">
            <CloudyIcon className="h-8 w-8 text-black" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-700">
            Sorry, this page isn't available.
          </h1>

          <p className="text-gray-500 text-lg">
            The link you followed maybe be broken, or the page may have been
            removed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            className="border-2 border-[#0086C9] bg-[#0086C9] hover:bg-[#0086C9] px-8 py-5"
            variant="default"
            onClick={() => navigate("/cases")}
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
