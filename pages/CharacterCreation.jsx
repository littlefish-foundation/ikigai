import React, { useState, useEffect, useRef } from "react";
import {
  getIkigaiElements,
  addDatatoUser,
  incrementSelectedCounts,
} from "../api/FirestoreAPI";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { storage, auth } from "../firebase-config";
import AvatarForm from "../components/UI/character-creation/AvatarForm";
import SocialLinksForm from "../components/UI/character-creation/SocialLinksForm";
import DescriptionForm from "../components/UI/character-creation/DescriptionForm";
import CompetencesForm from "../components/UI/character-creation/CompetencesForm";
import NeedsForm from "../components/UI/character-creation/NeedsForm";
import PreferencesForm from "../components/UI/character-creation/PreferencesForm";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * @summary CharacterCreation component.
 * @description
 * Renders the character creation interface.
 * Guides the user through a multi-step form to provide their avatar, social links, description, competences, preferences, and needs.
 *
 * @requires react: useState, useEffect
 * @requires next/router: useRouter
 * @requires ../firebase-config: auth
 * @requires ../api/FirestoreAPI: getIkigaiElements, addDatatoUser, incrementSelectedCounts
 * @requires react-toastify: toast
 * @requires ../components/UI/character-creation/AvatarForm: AvatarForm
 * @requires ../components/UI/character-creation/SocialLinksForm: SocialLinksForm
 * @requires ../components/UI/character-creation/DescriptionForm: DescriptionForm
 * @requires ../components/UI/character-creation/CompetencesForm: CompetencesForm
 * @requires ../components/UI/character-creation/NeedsForm: NeedsForm
 * @requires ../components/UI/character-creation/PreferencesForm: PreferencesForm
 *
 * @returns {JSX.Element} The rendered CharacterCreation component.
 */

const CharacterCreation = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    linkedin: "",
    github: "",
  });
  const [description, setDescription] = useState("");
  const [interests, setInterests] = useState();
  const [topSkills, setTopSkills] = useState();
  const [hobbies, setHobbies] = useState();
  const [values, setValues] = useState();
  const [knowledge, setKnowledge] = useState();
  const [expertise, setExpertise] = useState();
  const [worldNeeds, setWorldNeeds] = useState();
  const [communityNeeds, setCommunityNeeds] = useState();
  const [personalNeeds, setPersonalNeeds] = useState();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedTopSkills, setSelectedTopSkills] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [selectedWorldNeeds, setSelectedWorldNeeds] = useState([]);
  const [selectedCommunityNeeds, setSelectedCommunityNeeds] = useState([]);
  const [selectedPersonalNeeds, setSelectedPersonalNeeds] = useState([]);

  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    async function fetchIkigaiElements() {
      const ikigaiElements = await getIkigaiElements();

      setInterests(ikigaiElements.interests);
      setTopSkills(ikigaiElements.skills);
      setHobbies(ikigaiElements.hobbies);
      setValues(ikigaiElements.values);
      setKnowledge(ikigaiElements.knowledge);
      setExpertise(ikigaiElements.expertise);
      setWorldNeeds(ikigaiElements.world);
      setCommunityNeeds(ikigaiElements.community);
      setPersonalNeeds(ikigaiElements.you);
    }

    fetchIkigaiElements();
  }, []);

  const incrementCounts = async () => {
    const allSelected = {
      interests: selectedInterests,
      skills: selectedTopSkills,
      hobbies: selectedHobbies,
      values: selectedValues,
      knowledge: selectedKnowledge,
      expertise: selectedExpertise,
      world: selectedWorldNeeds,
      community: selectedCommunityNeeds,
      you: selectedPersonalNeeds,
    };

    try {
      await incrementSelectedCounts(allSelected);
    } catch (error) {
      console.error("Error incrementing counts:", error);
    }
  };

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      const ikigaiData = {
        socialLinks,
        description,
        ikigai: {
          what_do_you_love: {
            interests: selectedInterests,
            values: selectedValues,
            hobbies: selectedHobbies,
          },
          what_are_you_good_at: {
            skills: selectedTopSkills,
            knowledge: selectedKnowledge,
            expertise: selectedExpertise,
          },
          what_the_world_needs: {
            world: selectedWorldNeeds,
            community: selectedCommunityNeeds,
            you: selectedPersonalNeeds,
          },
        },
      };

      if (userId) {
        try {
          await addDatatoUser(userId, ikigaiData);
          await incrementCounts();
          router.push("/Profile");
          toast.success("Data saved successfully");
        } catch (error) {
          toast.error(error.message);
        }
      } else {
        toast.error("User not found");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAvatarSelected = async (file) => {
    if (userId && file) {
      const storageRef = ref(
        storage,
        `user-profile-image/${userId}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await addDatatoUser(userId, { avatarUrl: url });
        }
      );
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <AvatarForm
            avatar={avatar}
            setAvatar={setAvatar}
            onAvatarSelected={handleAvatarSelected}
          />
        );
      case 2:
        return (
          <SocialLinksForm
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
          />
        );
      case 3:
        return (
          <DescriptionForm
            description={description}
            setDescription={setDescription}
          />
        );
      case 4:
        return (
          <CompetencesForm
            topSkills={topSkills}
            selectedTopSkills={selectedTopSkills}
            setSelectedTopSkills={setSelectedTopSkills}
            knowledge={knowledge}
            selectedKnowledge={selectedKnowledge}
            setSelectedKnowledge={setSelectedKnowledge}
            expertise={expertise}
            selectedExpertise={selectedExpertise}
            setSelectedExpertise={setSelectedExpertise}
          />
        );
      case 5:
        return (
          <PreferencesForm
            values={values}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            hobbies={hobbies}
            selectedHobbies={selectedHobbies}
            setSelectedHobbies={setSelectedHobbies}
            interests={interests}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
          />
        );
      case 6:
        return (
          <NeedsForm
            worldNeeds={worldNeeds}
            selectedWorldNeeds={selectedWorldNeeds}
            setSelectedWorldNeeds={setSelectedWorldNeeds}
            communityNeeds={communityNeeds}
            selectedCommunityNeeds={selectedCommunityNeeds}
            setSelectedCommunityNeeds={setSelectedCommunityNeeds}
            personalNeeds={personalNeeds}
            selectedPersonalNeeds={selectedPersonalNeeds}
            setSelectedPersonalNeeds={setSelectedPersonalNeeds}
          />
        );
      default:
        return null;
    }
  };

  console.log(currentUser, userId);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-center mb-8">
            Character Creation - Step {step}
          </h1>
          {renderStep()}
          <div className="flex justify-between mt-8">
            <button
              className={`py-2 px-4 font-semibold rounded-lg shadow-md text-white ${
                step === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              }`}
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </button>
            <button
              className="py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 focus:outline-none"
              onClick={handleNext}
            >
              {step === 7 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
