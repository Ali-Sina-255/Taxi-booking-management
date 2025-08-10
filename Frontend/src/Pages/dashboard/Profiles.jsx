import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  updateUserProfile,
} from "../../state/userSlice/userSlice";
import { Loader2, Edit3, User, Mail, Phone, Home, Globe } from "lucide-react";

// A modern, reusable Input component for the form
const FormInput = ({
  control,
  name,
  label,
  errors,
  type = "text",
  icon: Icon,
  rules = { required: `${label} is required.` },
}) => (
  <div className="relative">
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <>
         
          <input
            {...field}
            type={type}
            placeholder={label}
            className={`peer block w-full rounded-lg border focus:outline-none border-gray-300 py-3 shadow-sm transition-colors duration-200  ${
              Icon ? "pl-4" : "pl-4"
            } pr-4 placeholder-transparent`}
          />
          <label
            htmlFor={name}
            className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
    ${
      field.value && field.value.length > 0
        ? "-top-2 text-xs text-black"
        : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
    }
  `}
          >
            {label}
          </label>
        </>
      )}
    />
    {errors[name] && (
      <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>
    )}
  </div>
);

function Profile() {
  const dispatch = useDispatch();
  const { profile, loading, accessToken } = useSelector((state) => state.user);
  const [photoPreview, setPhotoPreview] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      about_me: "",
      gender: "M",
      country: "AF",
      city: "",
      profile_photo: null,
    },
  });

  // Fetch profile data on mount if user logged in
  useEffect(() => {
    if (accessToken && !profile) {
      dispatch(fetchUserProfile());
    }
  }, [accessToken, profile, dispatch]);

  // Populate form when profile data arrives
  useEffect(() => {
    if (profile) {
      reset(profile);
      setPhotoPreview(profile.profile_photo);
    }
  }, [profile, reset]);

  const onPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("profile_photo", file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    console.log("Form Data Submitted:", data);
    dispatch(updateUserProfile(data));
    dispatch(updateUserProfile(data));
  };

  if (loading && !profile) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-gray-600">
        Could not load profile. Please try refreshing.
      </div>
    );
  }

  return (
    <div className=" p-3 md:p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-8 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={photoPreview || "/default-avatar.png"}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
              <label
                htmlFor="photo-upload"
                className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors"
              >
                <Edit3 size={16} />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoChange}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-md text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail size={16} /> {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                control={control}
                name="username"
                label="Username"
                errors={errors}
                icon={User}
              />
              <FormInput
                control={control}
                name="email"
                label="Email"
                type="email"
                errors={errors}
                icon={Mail}
              />
              <FormInput
                control={control}
                name="first_name"
                label="First Name"
                errors={errors}
                icon={User}
              />
              <FormInput
                control={control}
                name="last_name"
                label="Last Name"
                errors={errors}
                icon={User}
              />
              <FormInput
                control={control}
                name="phone_number"
                label="Phone Number"
                errors={errors}
                icon={Phone}
              />
              <FormInput
                control={control}
                name="city"
                label="City"
                errors={errors}
                icon={Home}
              />
            </div>
          </div>

          {/* About Me Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              About Me
            </h2>
            <Controller
              name="about_me"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows="4"
                  style={{
                    maxHeight: "7.5em", // 5 rows max height (5 × 1.5em line height)
                    lineHeight: "1.5em",
                    overflowY: "auto",
                    resize: "vertical", // optional: user can resize vertically only up to maxHeight
                  }}
                  placeholder="Tell us a little about yourself..."
                  className="w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200 focus:border-indigo-500 border p-3"
                />
              )}
            />
          </div>

          {/* Additional Details Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Additional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-lg border-gray-300 py-3 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                )}
              />
              <Controller
                name="country"
                control={control}
                rules={{ required: "Country is required." }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full rounded-lg border-gray-300 py-3 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                      errors.country ? "border-red-600" : ""
                    }`}
                  >
                    <option value="">Select Country</option>
                    <option value="AF">Afghanistan</option>
                    <option value="US">USA</option>
                    <option value="UK">UK</option>
                  </select>
                )}
              />
              {errors.country && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200 flex justify-center md:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
