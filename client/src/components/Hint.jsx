import { useState } from "react";
import { cleanString } from "../utils/cleanString";

const Hint = ({ track }) => {
  const [hint, setHint] = useState("");

  const determineHint = () => {
    let toShow = cleanString(track.name, false, true, true, false, false);

    //One character songs aren't given away
    if (!toShow || track.name.length === 1) {
      setHint("_");
      return;
    }

    setHint(toShow.charAt(0) + toShow.slice(1).replace(/[^ ]/g, "_"));
  };

  return (
    <>
      <button
        onClick={determineHint}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        Hint
      </button>
      {hint}
    </>
  );
};

export default Hint;
