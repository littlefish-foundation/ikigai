import React, { useState, useEffect } from "react";
import RenderSection from "../../common/RenderSection";
import { editProfile, updateSelectedCounts } from "../../../api/FirestoreAPI";

const PreferencesEditForm = ({ ikigaiElements, userIkigai, userId }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [previousSelections, setPreviousSelections] = useState({
    interests: [],
    hobbies: [],
    values: [],
  });

  useEffect(() => {
    if (userIkigai) {
      setSelectedInterests(userIkigai?.what_do_you_love?.interests || []);
      setSelectedHobbies(userIkigai?.what_do_you_love?.hobbies || []);
      setSelectedValues(userIkigai?.what_do_you_love?.values || []);
      setPreviousSelections({
        interests: userIkigai?.what_do_you_love?.interests || [],
        hobbies: userIkigai?.what_do_you_love?.hobbies || [],
        values: userIkigai?.what_do_you_love?.values || [],
      });
    }
  }, [
    userIkigai,
    setSelectedInterests,
    setSelectedHobbies,
    setSelectedValues,
    setPreviousSelections,
  ]);

  const handleSaveChanges = async () => {
    const updatedData = {
      ikigai: {
        ...userIkigai,
        what_do_you_love: {
          interests: selectedInterests,
          hobbies: selectedHobbies,
          values: selectedValues,
        },
      },
    };

    const newSelections = {
      interests: selectedInterests,
      hobbies: selectedHobbies,
      values: selectedValues,
    };

    await updateSelectedCounts(newSelections, previousSelections);

    editProfile(userId, updatedData);
  };

  return (
    <div>
      <RenderSection
        title="What are your interests?"
        options={ikigaiElements?.interests}
        selected={selectedInterests}
        onSelect={setSelectedInterests}
      />
      <RenderSection
        title="What are your hobbies?"
        options={ikigaiElements?.hobbies}
        selected={selectedHobbies}
        onSelect={setSelectedHobbies}
      />
      <RenderSection
        title="What are your values?"
        options={ikigaiElements?.values}
        selected={selectedValues}
        onSelect={setSelectedValues}
      />
      <div className="mt-6">
        <button
          className="bg-green-600 text-white font-semibold px-6 py-2 rounded shadow-md hover:bg-gray-700 focus:outline-none"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PreferencesEditForm;
