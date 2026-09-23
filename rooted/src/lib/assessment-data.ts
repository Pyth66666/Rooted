export interface Choice {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  help?: string;
  type: "single" | "multi" | "text";
  options?: Choice[];
}

export const QUESTIONS: Question[] = [
  {
    id: "hairTexture",
    title: "How would you describe your hair texture?",
    type: "single",
    options: [
      { value: "straight", label: "Straight" },
      { value: "wavy", label: "Wavy" },
      { value: "curly", label: "Curly" },
      { value: "coily", label: "Coily" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "hairThickness",
    title: "How would you describe the thickness of your hair strands?",
    type: "single",
    options: [
      { value: "fine", label: "Fine" },
      { value: "medium", label: "Medium" },
      { value: "thick", label: "Thick" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "scalpType",
    title: "How would you describe your scalp most of the time?",
    type: "single",
    options: [
      { value: "normal", label: "Normal" },
      { value: "oily", label: "Oily" },
      { value: "dry", label: "Dry" },
      { value: "combination", label: "Combination" },
      { value: "sensitive", label: "Easily irritated / sensitive" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "concerns",
    title: "What are your biggest hair and scalp concerns?",
    subtitle: "Choose all that apply.",
    help: "Note: ROOTED.MY provides cosmetic and product guidance, not a medical diagnosis.",
    type: "multi",
    options: [
      { value: "oily_fast", label: "Hair feels oily quickly" },
      { value: "dryness", label: "Dryness" },
      { value: "frizz", label: "Frizz" },
      { value: "dandruff", label: "Dandruff / flaking" },
      { value: "weak", label: "Hair feels weak / brittle" },
      { value: "rough", label: "Hair feels rough" },
      { value: "dull", label: "Hair looks dull" },
      { value: "tangle", label: "Hair gets tangled easily" },
      { value: "scalp_uncomfortable", label: "Scalp feels uncomfortable" },
      { value: "flat", label: "Hair looks flat / lacks volume" },
      { value: "shedding", label: "Excessive hair shedding" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "washFrequency",
    title: "How often do you wash your hair?",
    type: "single",
    options: [
      { value: "daily", label: "Every day" },
      { value: "four_six", label: "4–6 times a week" },
      { value: "two_three", label: "2–3 times a week" },
      { value: "once_less", label: "Once a week or less" },
    ],
  },
  {
    id: "washRoutine",
    title: "What do you usually use when washing your hair?",
    type: "single",
    options: [
      { value: "shampoo_only", label: "Shampoo only" },
      { value: "shampoo_conditioner", label: "Shampoo + conditioner" },
      { value: "shampoo_mask", label: "Shampoo + hair mask / treatment" },
      { value: "cowash", label: "Co-washing / other" },
      { value: "varies", label: "It varies" },
    ],
  },
  {
    id: "heatExposure",
    title: "How often are you exposed to Malaysia's hot and humid weather?",
    type: "single",
    options: [
      { value: "almost_daily", label: "Almost every day" },
      { value: "several_week", label: "Several times a week" },
      { value: "occasionally", label: "Occasionally" },
      { value: "mostly_indoor", label: "Mostly indoors" },
    ],
  },
  {
    id: "sweatFrequency",
    title:
      "How often do you sweat heavily from sports, commuting, outdoor work, or walking in the heat?",
    type: "single",
    options: [
      { value: "almost_daily", label: "Almost every day" },
      { value: "several_week", label: "Several times a week" },
      { value: "occasionally", label: "Occasionally" },
      { value: "rarely", label: "Rarely" },
    ],
  },
  {
    id: "headCovering",
    title: "Do you regularly wear a helmet, cap, hijab, or other head covering?",
    subtitle: "Choose all that apply.",
    type: "multi",
    options: [
      { value: "daily", label: "Daily" },
      { value: "several_week", label: "Several times a week" },
      { value: "occasionally", label: "Occasionally" },
      { value: "never", label: "Never" },
    ],
  },
  {
    id: "treatments",
    title: "Have you chemically or physically treated your hair recently?",
    subtitle: "Choose all that apply.",
    type: "multi",
    options: [
      { value: "dyed", label: "Dyed" },
      { value: "bleached", label: "Bleached" },
      { value: "permed", label: "Permed" },
      { value: "straightened", label: "Straightened / rebonded" },
      { value: "keratin", label: "Keratin / smoothing treatment" },
      { value: "none", label: "None" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
  {
    id: "heatStyling",
    title: "How often do you use heat styling?",
    type: "single",
    options: [
      { value: "daily", label: "Daily" },
      { value: "several_week", label: "Several times a week" },
      { value: "occasionally", label: "Occasionally" },
      { value: "rarely_never", label: "Rarely / never" },
    ],
  },
  {
    id: "productPriorities",
    title: "What matters most to you when choosing shampoo?",
    subtitle: "Choose all that apply.",
    type: "multi",
    options: [
      { value: "gentle", label: "Gentle cleansing" },
      { value: "moisture", label: "Moisture" },
      { value: "oil_control", label: "Oil control" },
      { value: "scalp_care", label: "Scalp care" },
      { value: "frizz_control", label: "Frizz control" },
      { value: "volume", label: "Volume" },
      { value: "damage", label: "Damage care" },
      { value: "color", label: "Color care" },
      { value: "simple", label: "Simple ingredients" },
      { value: "fragrance_free", label: "Fragrance-free" },
      { value: "affordable", label: "Affordable price" },
      { value: "natural", label: "Natural / plant-based" },
      { value: "sulfate_free", label: "Sulfate-free" },
      { value: "silicone_free", label: "Silicone-free" },
    ],
  },
  {
    id: "budget",
    title: "What price range would you normally consider for one bottle of shampoo?",
    type: "single",
    options: [
      { value: "under_15", label: "Under RM15" },
      { value: "15_30", label: "RM15–30" },
      { value: "31_50", label: "RM31–50" },
      { value: "51_80", label: "RM51–80" },
      { value: "80_plus", label: "RM80+" },
    ],
  },
  {
    id: "currentProduct",
    title: "What shampoo are you currently using?",
    subtitle: "Search the ROOTED.MY picks, or tell us the name.",
    type: "text",
  },
  {
    id: "personalGoal",
    title: "What would you most like to improve about your hair?",
    type: "text",
  },
];
