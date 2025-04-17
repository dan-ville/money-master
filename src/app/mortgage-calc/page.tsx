"use client"

import { useState } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { usStates } from "@/lib/us-states"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  getPropertyTaxByState,
  getTrueCostsOfHome,
} from "@/lib/functions/mortgage"
import { HelpText } from "@/components/ui/help-text"

const formSchema = z.object({
  principal: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(1000, "Minimum loan amount is $1,000"),
  interestRate: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Interest rate must be positive"
    )
    .refine((val) => parseFloat(val) <= 30, "Interest rate cannot exceed 30%"),
  loanTerm: z.coerce
    .number()
    .int()
    .positive("Loan term must be positive")
    .max(50, "Maximum term is 50 years"),
  pmiRate: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "PMI rate cannot be negative"
    ),
  insuranceRate: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Insurance rate cannot be negative"
    ),
  state: z.string(),
  propertyTaxRate: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Property tax rate cannot be negative"
    ),
})
// Define the form values type
type FormValues = z.infer<typeof formSchema>

// Format currency helper
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function MortgageCalculator() {
  const [showStates, setShowStates] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 300000,
      interestRate: "4.5",
      loanTerm: 30,
      pmiRate: "0.5",
      insuranceRate: "0.35",
      state: "Alabama",
      propertyTaxRate: "0.35",
    },
    mode: "onChange",
  })


  return (
    <Form {...form}>
      <div className="max-w-3xl my-6 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Cost Calculator</CardTitle>
            <CardDescription>
              Calculate the total cost of buying a house over the life of the
              mortgage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="300000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="4.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className="col-span-2" />
                <p className="col-span-2 text-muted-foreground text-sm">{`Other stuff you should fill out so you know what you're really getting into.`}</p>
                <FormField
                  control={form.control}
                  name="pmiRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        PMI Rate (%)
                        <HelpText>
                          <a
                            href="https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/"
                            target="_blank"
                          >
                            Private mortgage insurance (PMI)
                          </a>{" "}
                          is a type of insurance that protects a lender if a
                          borrower defaults on a conventional mortgage. PMI is
                          typically required when the down payment is less than
                          20% of the home&apos;s purchase price.
                        </HelpText>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.35"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Tax Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.35"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showStates ? (
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Property Tax Rates By State (2023)
                        </FormLabel>
                        <Select
                          defaultValue="Alabama"
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue(
                              "propertyTaxRate",
                              parseFloat(
                                getPropertyTaxByState(value)
                              ).toString()
                            )
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usStates.map((state) => (
                              <SelectItem key={state.label} value={state.label}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowStates(true)}
                    className="self-end text-muted-foreground"
                  >
                    Help me find this?
                  </Button>
                )}
              </div>
            </form>

            <Results />
          </CardContent>
        </Card>
      </div>
    </Form>
  )
}

function Results() {
  const form = useFormContext<FormValues>()

  const results = getTrueCostsOfHome({
    principal: form.watch("principal"),
    interestRate: form.watch("interestRate"),
    loanTermYears: form.watch("loanTerm"),
    pmiRate: form.watch("pmiRate"),
    propertyTaxRate: form.watch("propertyTaxRate"),
    insuranceRate: form.watch("insuranceRate"),
  })

  return (
    <div className="mt-8 space-y-4">
      <Separator />
      <h3 className="text-xl font-semibold">Results</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm text-muted-foreground">
            Monthly Mortgage Payment
          </h4>
          <p className="text-2xl font-bold">
            {formatCurrency(results.mortgagePayment)}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm text-muted-foreground">
            Total Cost
          </h4>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(results.totalCost)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Monthly Breakdown</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>Principal & Interest:</div>
          <div className="text-right">
            {formatCurrency(results.mortgagePayment)}
          </div>

          <div>PMI:</div>
          <div className="text-right">{formatCurrency(results.monthlyPmi)}</div>

          <div>Insurance:</div>
          <div className="text-right">
            {formatCurrency(results.monthlyInsurance)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Lifetime Costs</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>Principal:</div>
          <div className="text-right">
            {formatCurrency(form.watch("principal"))}
          </div>

          <div>Total Interest:</div>
          <div className="text-right">
            {formatCurrency(results.totalInterest)}
          </div>

          <div>Total PMI:</div>
          <div className="text-right">{formatCurrency(results.totalPmi)}</div>

          <div>Total Insurance:</div>
          <div className="text-right">
            {formatCurrency(results.totalInsurance)}
          </div>

          <div>Total Property Taxes Paid:</div>
          <div className="text-right">
            {formatCurrency(results.totalPropertyTax)}
          </div>
          <Separator className="col-span-2" />
          <div>
            <strong>Total Cost:</strong>
          </div>
          <div className="text-right">
            <strong>{formatCurrency(results.totalCost)}</strong>
          </div>

          <div>
            <strong>Adjusted Monthly Payment:</strong>{" "}
            <HelpText>
              {`This is what the monthly cost works out to when factoring in those extra costs. It's not what you're going to see leaving your bank account every month, but it helps to understand what your investment in a home is actually costing over the lifetime of the loan. Note: this is only an estimate of what it would cost if you if everything stayed the same and you didn't make any extra payments on the principle at all.`}
            </HelpText>
          </div>
          <div className="text-right">
            <strong>
              {formatCurrency(results.totalCost / form.watch("loanTerm") / 12)}
            </strong>
          </div>
        </div>
      </div>
      <CardFooter className="text-sm text-muted-foreground">
        <em>
          <span className="text-primary">Note</span>: This is an estimate.
          Actual costs may vary based on specific lender terms, property taxes,
          and other factors.
        </em>
      </CardFooter>
    </div>
  )
}
