"use client";

import qs from "query-string";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useState } from "react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import Select, {
  components,
  DropdownIndicatorProps,
  ClearIndicatorProps,
} from "react-select";
import { ChevronDown, X } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </components.DropdownIndicator>
  );
};

export const AccountFilter = () => {
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      width: "100%", // Full width
      minWidth: "190px", // Auto width for `lg:w-auto` behavior
      height: "36px", // Corresponds to `h-9`
      borderRadius: "0.375rem", // Corresponds to `rounded-md`
      padding: "0 0.75rem", // Corresponds to `px-3`
      backgroundColor: state.isFocused
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(255, 255, 255, 0.1)", // Matches `bg-white/10` and `focus:bg-white/30`
      color: "white", // Matches `text-white`
      border: "none", // No border, corresponds to `border-none`
      transition: "background-color 150ms ease-in-out", // Matches the `transition` effect
      outline: "none", // Corresponds to `outline-none`
      boxShadow: state.isFocused
        ? "none" // Removes default focus outline shadow
        : "none", // No shadow by default
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.2)", // Corresponds to `hover:bg-white/20`
      },
      "&:focus": {
        boxShadow: "none",
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      padding: "0",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "white", // Matches `text-white`
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "white", // Selected value is white as well
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      padding: "0",
      color: "white", // Dropdown icon matches `text-white`
      "&:hover": {
        color: "white",
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      padding: "0",
      color: "white", // Clear icon matches `text-white`
      "&:hover": {
        color: "white",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      width: "auto", // Ensure the dropdown menu has a fixed width // Matches the control width
      backgroundColor: "white", // Matches the dropdown background color
      color: "black", // Text inside dropdown will be black to contrast with white background
      borderRadius: "0.375rem", // Rounded corners for dropdown menu
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for menu
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "rgba(0, 0, 0, 0.1)" : "transparent", // Light background on hover
      color: "black", // Option text remains black
      padding: "0.375rem 1.25rem", // Padding for options
      cursor: "pointer",
      "&:active": {
        backgroundColor: "rgba(0, 0, 0, 0.1)", // Light background on active state
      },
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    indicatorSeparator: () => ({
      display: "none", // Remove separator line
    }),
  };

  const pathname = usePathname();
  const router = useRouter();
  const { data: accounts, isLoading: isLoadingAccount } = useGetAccounts();

  const params = useSearchParams();
  const from = params.get("from");
  const to = params.get("to");
  const accountId = params.get("accountId") || "";

  const options = [
    { value: "", label: "All accounts" },
    ...(accounts
      ? accounts.map((account) => ({
          value: account.id.toString(),
          label: account.name,
        }))
      : []),
  ];

  const onChange = (selectedOption: any) => {
    const newValue = selectedOption ? selectedOption.value : "";

    const query = {
      accountId: newValue,
      from,
      to,
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true },
    );

    router.push(url);
  };

  return (
    <Select
      onChange={onChange}
      options={options}
      isLoading={isLoadingAccount}
      placeholder="Select Account"
      styles={customStyles}
      isClearable
    />
  );
};
