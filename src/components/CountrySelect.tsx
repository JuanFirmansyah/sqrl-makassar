// components/CountrySelect.tsx
import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';

interface CountryOption {
  value: string;
  label: string;
}

interface CountrySelectProps {
  onChange: (value: CountryOption) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ onChange }) => {
  const options = useMemo(() => countryList().getData(), []);
  const [value, setValue] = useState<CountryOption | null>(null);

  const handleChange = (selectedOption: CountryOption | null) => {
    setValue(selectedOption);
    if (selectedOption) {
      onChange(selectedOption);
    }
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select a country"
    />
  );
};

export default CountrySelect;
