import React, { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { useTheme } from "@/hooks/ThemeContext";
import { API_URL } from "@/config.json";
export const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional"
];

// Visibility option 
export const TYPE = [
  "Event",
  "Coaching Session"
];

// Custom hook to fetch sports list from API
export const useSportsList = () => {
  const [sportsList, setSportsList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSportsList = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/utils/sports_list`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sports list: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSportsList(data);
        } else {
          // If API returns object with sports array
          setSportsList(data.sports || []);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sports list');
        console.error('Error fetching sports list:', err);
        // Fallback to default list if API fails
        setSportsList(DEFAULT_SPORTS_LIST);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSportsList();
  }, []);
  
  return { sportsList, loading, error };
};

// Default sports list as fallback
export const DEFAULT_SPORTS_LIST = [
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

interface DropdownProps {
  items: { label: string; value: string }[];
  value: string;
  onChangeItem: (item: { label: string; value: string }) => void;
  placeholder: string;
  searchable?: boolean;
  searchablePlaceholder?: string;
  zIndex?: number;
  zIndexInverse?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChangeItem,
  placeholder,
  searchable = false,
  searchablePlaceholder = 'Search...',
  zIndex,
  zIndexInverse,
}) => {
  const [open, setOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState(items);
  const { colors } = useTheme();

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
      searchable={searchable}
      searchPlaceholder={searchablePlaceholder}
      style={{
        marginBottom: 15,
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: 5,
      }}
      dropDownContainerStyle={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
      textStyle={{ color: colors.text }}
      labelStyle={{ color: colors.text }}
      searchTextInputStyle={{ color: colors.smalltext }}
      searchPlaceholderTextColor={colors.smalltext}
      listMode="SCROLLVIEW"
      scrollViewProps={{
        nestedScrollEnabled: true,
      }}
      zIndex={zIndex || 1000}
      zIndexInverse={zIndexInverse || 3000}
    />
  );
};

export default Dropdown;