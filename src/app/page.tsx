import { Metadata } from "next"
import MortgageCalculator from "./mortgage-calc/page"

export const metadata: Metadata = {
  title: "Money Master",
  description: "Learn to speak money",
  icons: {
    icon: "favicon.svg",
  },
}
export default function Home() {
  return <MortgageCalculator />
}
