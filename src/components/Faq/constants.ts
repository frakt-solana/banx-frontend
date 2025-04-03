export enum FaqType {
  MULTIPLY = 'multiply',
  BORROW = 'borrow',
  LISTING = 'listing',
}

export interface FaqItem {
  question: string
  answer: string
}

interface FaqContent {
  [key: string]: FaqItem[]
}

export const FAQ_DATA: FaqContent = {
  [FaqType.MULTIPLY]: [
    {
      question: 'What is ‘Multiply’ and how does it affect my risk?',
      answer:
        'Multiply lets you borrow additional funds to mint more tokens, increasing potential yields from staking or farming. However, a higher multiplier also means greater risk.',
    },
    {
      question: 'How do I track and manage my liquidation threshold?',
      answer: 'You can manage your positions on Portfolio -> My multiplies page.',
    },
    {
      question: 'Which tokens can I use for leverage, and how do I pick the right one?',
      answer: 'It’s all up to you. You use the kind of collateral will meet your goals.',
    },
  ],
  [FaqType.BORROW]: [
    {
      question: 'How do I repay my loan, and can I do it early?',
      answer:
        'Banx loans are perpetual as long as the borrower and lender are satisfied with the terms of the loan. You can repay your loan in full or partially anytime.',
    },
    {
      question: 'Are there any loans limits or conditions?',
      answer:
        'They last at least 3 days and don’t expire if you keep them healthy with small repayments.',
    },
    {
      question: 'What happens if my collateral’s price changes?',
      answer:
        'Banx is p2p protocol. It all depends on the satisfaction with the terms of the loan on both sides: lender and borrower.',
    },
  ],
  [FaqType.LISTING]: [
    {
      question: 'Can my loan be partially funded?',
      answer: 'No. Lender can only fund loans in full.',
    },
    {
      question: 'Can I change or cancel my listing after it’s published?',
      answer: 'You can just delist your listings on Portfolio -> My loans page, ‘Listings’ tab.',
    },
    {
      question: 'How do I pick the right APR and freeze period to attract lenders?',
      answer:
        'It’s all up to you. But remember, loans with the higher APR and minimum freeze period are more attractive for lender.',
    },
  ],
}
