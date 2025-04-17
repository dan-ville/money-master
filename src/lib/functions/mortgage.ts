import propertyTaxRates from "@/lib/property-taxes/2023/rates.json"

type Inputs = {
  principal: number
  interestRate: string
  loanTermYears: number // 15 or 30 years
  pmiRate: string
  insuranceRate: string
  propertyTaxRate: string
}

/*
The standard formula for calculating a mortgage payment is as follows:

M = P ( i(1 + i)^n ] ) /  ( (1 + i)^n – 1 ), where: 
M: is the monthly mortgage payment. 
P: is the principal loan amount (the amount borrowed). 
i: is the monthly interest rate (annual interest rate divided by 12). 
n: is the total number of payments (loan term in years multiplied by 12). 

That is to say, the total cost of a mortgage is given by the principal amount plus 
the interest rate over the loan term. Usually, the loan term is 15 or 30 years, and the interest rate is a percentage of the principal amount paid every month. So, you have to sum the monthly interest payments for every month until the mortgage is paid off and add that to the principal amount.
*/

export const getMonthlyMortgage = (
  inputs: Pick<Inputs, "principal" | "interestRate" | "loanTermYears">
) => {
  const {
    principal,
    interestRate,
    loanTermYears,
    // pmiRate, insuranceRate, propertyTaxRate
  } = inputs

  // * Monthly interest rate
  // Get the monthly  interest rate (divide rate by 12) as a decimal (divide by 100)
  const monthlyRate = parseFloat(interestRate) / 100 / 12

  // * Total number of payments
  // 15 year vs 30 mortgage
  // Monthly payments, so it will either be 180 or 360 months
  const numberOfPayments = loanTermYears * 12

  // Monthly principal and interest payment
  // P ( i(1 + i)^n ] ) /  ( (1 + i)^n – 1 )
  // i(1 + i)^n can be thought of as "compound interest over time"
  // x = i(1 + i)^n === ( P * x ) / ( x - 1)
  const x = Math.pow(1 + monthlyRate, numberOfPayments) // x = i(1 + i)^n = compound interest over time
  const monthlyPayment = (principal * x * monthlyRate) / (x - 1)

  return {
    monthlyPayment,
  }
}

export function getTrueCostsOfHome(inputs: Inputs) {
  const {
    principal,
    interestRate,
    loanTermYears,
    pmiRate,
    insuranceRate,
    propertyTaxRate,
  } = inputs

  const loanTermYearsNum = Number(loanTermYears)
  const pmiRateNum = parseFloat(pmiRate)
  const insuranceRateNum = parseFloat(insuranceRate)
  const propertyTaxRateNum = parseFloat(propertyTaxRate)

  // PMI calculation (typically applies if down payment is less than 20%)
const monthlyPmi = (principal * pmiRateNum / 100) / 12

  // Insurance calculation
  const annualInsurance = principal * (insuranceRateNum / 100)
  const monthlyInsurance = annualInsurance / 12

  const numberOfPayments = loanTermYears * 12

  // This monthly payment factors in the interest rates
  const { monthlyPayment } = getMonthlyMortgage({
    principal,
    interestRate,
    loanTermYears,
  })

  // Total cost over the life of the loan
  const totalPrincipalAndInterest = monthlyPayment * numberOfPayments
  const totalPmi = monthlyPmi * numberOfPayments // Note: PMI typically drops off after 20% equity
  const totalInsurance = monthlyInsurance * numberOfPayments


  // Total interest paid
  const totalInterest = totalPrincipalAndInterest - principal

  const yearlyPropertyTax = principal * propertyTaxRateNum / 100
  const monthlyPropertyTax = yearlyPropertyTax / 12
  const totalPropertyTax = yearlyPropertyTax * loanTermYearsNum

  // Statistics show an estimate of 1-3% of the cost of the house is spent on repairs, maintenance, or furnishing every year
  const annualMaintenanceRate = principal * parseFloat("3.00")
  const monthlyMaintenanceRate = annualMaintenanceRate / 12

  // Total monthly payment factoring mortgage premium (with interest), PMI, insurance,
  const totalMonthlyPayment =
    monthlyPayment +
    monthlyPmi +
    monthlyInsurance +
    monthlyPropertyTax +
    monthlyMaintenanceRate

  const totalCost = totalPrincipalAndInterest + totalPmi + totalInsurance + totalPropertyTax

  return {
    mortgagePayment: monthlyPayment,
    totalInterest,
    totalPmi,
    totalInsurance,
    totalMonthlyPayment,
    totalCost,
    yearlyPropertyTax,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPmi,
    totalPropertyTax
  }
}

export function getPropertyTaxByState(state: string) {
  const rate = propertyTaxRates.find((x) => x.State === state)?.[
    "Effective Tax Rate (2023)"
  ]
  if (rate === undefined) throw new Error("Could not find state? Huh??")

  return rate
}
