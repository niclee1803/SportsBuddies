import React, { useState }from "react";
import DropDownPicker from "react-native-dropdown-picker";



// Predefined list of sports
export const SPORTS_LIST = [
  "Basketball",
  "Football",
  "Soccer",
  "Tennis",
  "Volleyball",
  "Swimming",
  "Golf",
  "Baseball",
  "Cycling",
  "Running",
  "Hiking",
  "Yoga",
  "Boxing",
  "Martial Arts",
  "Skiing",
  "Snowboarding",
  "Surfing"
];


// Skill level options
export const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Professional"
];

// Visibility option 
export const Visibility=[

  "Everyone",
  "Friends Only"
]

interface DropdownProps {
  items: { label: string; value: string }[];
  value: string;
  onChangeItem: (item: { label: string; value: string }) => void;
  placeholder: string;
}


const Dropdown: React.FC<DropdownProps> = ({ items, value, onChangeItem, placeholder }) => {
  const [open, setOpen] = useState(false); // Required in v5+
  const [dropdownItems, setDropdownItems] = useState(items);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={dropdownItems}
      setOpen={setOpen}
      setValue={(callback) => {
        const selectedValue = callback(value);
        const selectedItem = dropdownItems.find((item) => item.value === selectedValue);
        if (selectedItem) {
          onChangeItem(selectedItem);
        }
      }}
      setItems={setDropdownItems}
      placeholder={placeholder}
      style={{
        marginBottom: 15,
        backgroundColor: "#fff",
        borderColor: "#ddd",
        borderRadius: 5,
      }}
    />
  );
};


// const Dropdown: React.FC<DropdownProps> = ({ items, value, onChangeItem, placeholder }) => {
//   return (
//     <DropDownPicker
//       items={items}
//       value={value}
//       onChangeItem={onChangeItem}
//       style={{ marginBottom: 15, backgroundColor: "#fff", borderColor: "#ddd", borderRadius: 5 }}
//       placeholder={placeholder}
//     />
//   );
// };

export default Dropdown;
