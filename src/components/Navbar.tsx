import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getInitials } from "@/utils";
import NotificationDrawer from "./NotificationDrawer";
import {
  BellIcon,
  ChevronRight,
  FileText,
  LogOut,
  Menu,
  User,
  User2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { RootState } from "@/store";
import Logo from "@/assets/XiquelLogo01.png";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData } from "@/slices/authSlice";
import { SelectSeparator } from "./ui/select";
import { Separator } from "@radix-ui/react-select";
import { Badge } from "./ui/badge";
import config from "@/config";

const Navbar = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigations = useSelector(
    (state: RootState) => state.details.navigation
  );
  const userDetails = useSelector(
    (state: RootState) => state.details.requestResults
  );
  const quickActions = useSelector(
    (state: RootState) => state.quickActions.quickActions
  );
  const filteredNav = navigations.filter(
    (item) =>
      item.placementText === "Top" || item.placementText === "Top & Bottom"
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleProfileNavigation = () => {
    navigate(
      `/${userDetails.relatedObjectIdObjectTypeCode === "Employee" ? "student" : "ap"}/edit-profile`
    );
  };

  const handleLogout = () => {
    dispatch(clearAuthData());
    navigate("/login");
  };

  const getUserType = () => {
    if (userDetails.relatedObjectIdObjectTypeCode === "Supplier") {
      if (userDetails.aPtype === "Institution") {
        return "Institution";
      }
      return "Accommodation Provider";
    }
    if (userDetails.relatedObjectIdObjectTypeCode === "Employee") {
      return "Student";
    }
    return "";
  };

  return (
    <div>
      {/* Desktop Navigation */}
      <nav className="hidden md:block  bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/cases" className="flex-shrink-0">
              <img src={Logo} alt="NSFAS" className="h-12" />
            </Link>

            <div className="flex items-center space-x-8">
              {/* {filteredNav?.map((item) => (
                <Link
                  key={item.navigate}
                  to={item.navigate}
                  className="text-sm lg:text-md font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {item.title}
                </Link>
              ))} */}
            </div>

            <div className="flex items-center space-x-4">
              {/* <span className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis text-sm text-[#363F72] bg-[#F8F9FC] border border-[#D5D9EB] py-1 px-2 rounded-full font-medium max-w-[200px]">
                {getUserType()}
              </span> */}

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <div className="h-9 w-9 cursor-pointer  rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                    {getInitials(userDetails)}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                  {/* {userDetails.aPtype != 'Institution' && (
                    <DropdownMenuCheckboxItem className="font-medium pl-4" onClick={handleProfileNavigation}>
                      <User2 className="mr-1 h-4" /> Profile
                    </DropdownMenuCheckboxItem>
                  )} */}
                  <DropdownMenuCheckboxItem
                    className="font-medium pl-4 text-black"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-1 h-4 text-black" /> Logout
                  </DropdownMenuCheckboxItem>
                  {/* {config.envKey === 'development' ||
                    (config.envKey === 'staging' && (
                      <DropdownMenuCheckboxItem className="mt-2 cursor-not-allowed font-semibold text-purple-600 uppercase border bg-purple-50 border-purple-200">
                        {config.envKey}
                      </DropdownMenuCheckboxItem>
                    ))} */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* <div className="relative cursor-pointer">
                <BellIcon className="h-6 w-6" onClick={() => setNotificationOpen(true)} />
                {quickActions.length > 0 && (
                  <span className="absolute -top-[0.45rem] -right-[0.5rem] text-white bg-orange-500 rounded-full font-medium  text-xs px-[0.35rem]">
                    {quickActions.length}
                  </span>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b bg-white border-orange-500">
        <div className="flex items-center justify-between px-4 h-20">
          <Sheet>
            {/* <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-8 w-8 text-black" />
              </Button>
            </SheetTrigger> */}
            <SheetContent
              side="left"
              className="w-[320px] p-0 bg-gradient-to-b from-white to-gray-50"
            >
              <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="px-6 py-6 border-b border-gray-200 bg-white">
                  <Link to="/" className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative">
                      <img src={Logo} alt="NSFAS" className="h-12 w-auto" />
                    </div>
                  </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  <div className="space-y-1">
                    {/* {navigations.map((item) => {
                      const isActive = location.pathname === item.navigate;

                      return (
                        <Link
                          key={item.navigate}
                          to={item.navigate}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                    group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "bg-gray-500 text-white shadow-lg shadow-gray-500/25 transform scale-[1.02]"
                        : "text-gray-700 "
                    }
                  `}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`
                      flex-shrink-0 transition-colors duration-200
                      ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-500"}
                    `}
                            ></div>
                            <span className="truncate">{item.title}</span>
                          </div>

                          <ChevronRight
                            className={`
                    h-4 w-4 transition-all duration-200
                    ${
                      isActive
                        ? "text-white opacity-100 transform translate-x-1"
                        : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                    }
                  `}
                          />
                        </Link>
                      );
                    })} */}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-4 ml-auto">
            {/* <span className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis text-sm text-[#363F72] bg-[#F8F9FC] border border-[#D5D9EB] py-1 px-2 rounded-full font-medium max-w-[200px]">
              {getUserType()}
            </span> */}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="h-9 w-9 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                  {getInitials(userDetails)}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
                {/* {userDetails.aPtype != "Institution" && (
                  <DropdownMenuCheckboxItem
                    className="font-medium pl-4"
                    onClick={handleProfileNavigation}
                  >
                    <User2 className="mr-1 h-4" /> Profile
                  </DropdownMenuCheckboxItem>
                )} */}
                <DropdownMenuCheckboxItem
                  className="font-medium pl-4 text-black"
                  onClick={handleLogout}
                >
                  {" "}
                  <LogOut className="mr-1 h-4 text-black" /> Logout
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <div className="relative cursor-pointer">
              <BellIcon
                className="h-6 w-6"
                onClick={() => setNotificationOpen(true)}
              />
              {quickActions.length > 0 && (
                <span className="absolute -top-[0.45rem] -right-[0.5rem] text-white bg-orange-500 rounded-full font-medium  text-xs px-[0.35rem]">
                  {quickActions.length}
                </span>
              )}
            </div> */}
          </div>
        </div>
      </nav>

      <NotificationDrawer
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
      />
    </div>
  );
};

export default Navbar;
