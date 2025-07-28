import { useUserPreferences } from "../../context/UserPreferencesContext";
import { useUsername } from "../../context/UsernameContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { API_URL } from "../../context/myurl";
const disasterTypeOptions = [
  "Earthquake",
  "Flood",
  "Wildfire",
  "Landslide",
  "Hurricane",
  "Tsunami",
];

const Settings = () => {
  const { userPreferences, setUserPreferences } = useUserPreferences();
  const { username } = useUsername();
  const [userSettings, setUserSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userPreferences) {
      setUserSettings(userPreferences);
    }
  }, [userPreferences]);

  const handleToggle = () => {
    setUserSettings((prev) => ({
      ...prev,
      receive_night_alerts: !prev.receive_night_alerts,
    }));
  };

  const handleDropdownChange = (key, value) => {
    setUserSettings({ ...userSettings, [key]: value });
  };

  const handleSliderChange = (e) => {
    setUserSettings({ ...userSettings, radius: parseInt(e.target.value, 10) });
  };

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken || !username) {
      alert("Missing access token or username.");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_URL}/${username}/preferences/`,
        userSettings,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setUserPreferences(response.data);
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (!userSettings) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>

        {/* Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Receive Night Alerts</span>
          <div
            onClick={handleToggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              userSettings.receive_night_alerts ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                userSettings.receive_night_alerts
                  ? "translate-x-6"
                  : "translate-x-0"
              }`}
            />
          </div>
        </div>

        {/* Country Dropdown */}
        {/* <div className="space-y-1">
          <label className="block text-gray-700 font-medium">Country</label>
          <div className="relative">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              value={userSettings.country}
              onChange={(e) => handleDropdownChange("country", e.target.value)}
            >
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div> */}

        {/* Continent Dropdown */}
        {/* <div className="space-y-1">
          <label className="block text-gray-700 font-medium">Continent</label>
          <div className="relative">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              value={userSettings.continent}
              onChange={(e) =>
                handleDropdownChange("continent", e.target.value)
              }
            >
              {continentOptions.map((continent) => (
                <option key={continent} value={continent}>
                  {continent}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div> */}

        {/* Radius Slider */}
        <div className="space-y-1">
          <label className="block text-gray-700 font-medium">
            Notification Radius (km)
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={userSettings.radius}
            onChange={handleSliderChange}
            className="w-full accent-green-500"
          />
          <div className="text-sm text-gray-500 mt-1">
            Current: {userSettings.radius} km
          </div>
        </div>

        {/* Disaster Types Multi-Select */}
        <div className="space-y-1">
          <label className="block text-gray-700 font-medium">
            Disaster Types
          </label>
          <div className="flex flex-wrap gap-2">
            {disasterTypeOptions.map((type) => {
              const isSelected = userSettings.disaster_types?.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm border ${
                    isSelected
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
                  } transition`}
                  onClick={() => {
                    setUserSettings((prev) => {
                      const currentTypes = prev.disaster_types || [];
                      const newTypes = isSelected
                        ? currentTypes.filter((t) => t !== type)
                        : [...currentTypes, type];
                      return { ...prev, disaster_types: newTypes };
                    });
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
