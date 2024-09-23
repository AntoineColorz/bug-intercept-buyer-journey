import React, { useState } from "react";
import {
  reactExtension,
  BlockStack,
  useBuyerJourneyIntercept,
  useApplyCartLinesChange,
  useApi,
  ChoiceList,
  Choice,
  Text,
  TextField,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.shipping-option-list.render-before",
  () => <Extension />
);

const choiceListExemple = [
  { label: "Choice 1", value: "choice_1" },
  { label: "Choice 2", value: "choice_2" },
  { label: "Choice 3", value: "choice_3", haveDetails: true },
];

function Extension() {
  const { lines } = useApi();

  const [selectedChoice, setSelectedChoice] = useState("choice_1");
  const [textFieldContent, setTextFieldContent] = useState("");

  const applyCartLinesChange = useApplyCartLinesChange();
  const cartLines = lines.current;

  useBuyerJourneyIntercept(() => {
    if (selectedChoice === "choice_3" && textFieldContent === "") {
      return {
        behavior: "block",
        reason: "choice empty",
        errors: [
          {
            message: "You must provide details for choice 3",
          },
        ],
        perform: () => {
          console.log("🚩 _ BLOCK _ 🚩", performance.now());
        },
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        console.log("✅ _ ALLOW _ ✅", performance.now());
      },
    };
  });

  return (
    <BlockStack>
      <ChoiceList
        name="requestedTest"
        onChange={(value) => onChoiceListChange(value)}
        value={selectedChoice}
        variant="group"
      >
        {choiceListExemple.map((choice) => (
          <Choice
            id={`${choice.value}`}
            key={`${choice.value}_key`}
            details={
              choice.haveDetails && (
                <TextField
                  label={choice.label}
                  value={textFieldContent}
                  onChange={(value) => setTextFieldContent(value)}
                ></TextField>
              )
            }
          >
            <Text>{choice.label}</Text>
          </Choice>
        ))}
      </ChoiceList>
    </BlockStack>
  );

  async function onChoiceListChange(value) {
    setSelectedChoice(value);
    setTextFieldContent("");

    const customAttribute = [
      {
        key: "choice",
        value: value,
      },
    ];

    for (const cartLine of cartLines) {
      await applyCartLinesChange({
        type: "updateCartLine",
        id: cartLine.id,
        attributes: customAttribute,
      });
    }
  }
}
