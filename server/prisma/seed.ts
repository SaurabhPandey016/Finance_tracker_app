import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Salary", type: TransactionType.INCOME, icon: "BriefcaseBusiness", color: "#7C8957" },
  { name: "Freelance", type: TransactionType.INCOME, icon: "Laptop", color: "#9B9A5A" },
  { name: "Investments", type: TransactionType.INCOME, icon: "TrendingUp", color: "#657A4D" },
  { name: "Gift", type: TransactionType.INCOME, icon: "Gift", color: "#A58B5B" },
  { name: "Other Income", type: TransactionType.INCOME, icon: "CircleDollarSign", color: "#87966B" },
  { name: "Rent", type: TransactionType.EXPENSE, icon: "House", color: "#6E6F3C" },
  { name: "Food and Dining", type: TransactionType.EXPENSE, icon: "Utensils", color: "#A36F4C" },
  { name: "Transport", type: TransactionType.EXPENSE, icon: "Car", color: "#6B7D6B" },
  { name: "Shopping", type: TransactionType.EXPENSE, icon: "ShoppingBag", color: "#9A7053" },
  { name: "Bills and Utilities", type: TransactionType.EXPENSE, icon: "ReceiptText", color: "#7D8052" },
  { name: "Health", type: TransactionType.EXPENSE, icon: "HeartPulse", color: "#A65D50" },
  { name: "Entertainment", type: TransactionType.EXPENSE, icon: "Clapperboard", color: "#887A55" },
  { name: "Education", type: TransactionType.EXPENSE, icon: "GraduationCap", color: "#687A8B" },
  { name: "Travel", type: TransactionType.EXPENSE, icon: "Plane", color: "#788B69" },
  { name: "Other", type: TransactionType.EXPENSE, icon: "Ellipsis", color: "#8A8776" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name_type: { name: category.name, type: category.type } },
      update: { icon: category.icon, color: category.color, isSystem: true },
      create: { ...category, isSystem: true },
    });
  }

  const passwordHash = await bcrypt.hash("Demo@1234", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@fintrack.app" },
    update: { name: "Demo User", passwordHash, currency: "INR" },
    create: { name: "Demo User", email: "demo@fintrack.app", passwordHash, currency: "INR" },
  });

  const existingCount = await prisma.transaction.count({ where: { userId: demoUser.id } });
  if (existingCount > 0) return;

  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((category) => [`${category.type}:${category.name}`, category.id]));
  const transactions: Array<{
    type: TransactionType;
    categoryId: string;
    amountMinor: number;
    note: string;
    date: Date;
  }> = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setMonth(date.getMonth() - monthOffset);

    const salary = new Date(date);
    salary.setDate(1);
    transactions.push({ type: TransactionType.INCOME, categoryId: categoryMap.get("INCOME:Salary")!, amountMinor: 8500000, note: "Monthly salary", date: salary });

    const rent = new Date(date);
    rent.setDate(2);
    transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Rent")!, amountMinor: 1850000, note: "Apartment rent", date: rent });

    const groceries = new Date(date);
    groceries.setDate(7);
    transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Food and Dining")!, amountMinor: 385000 + (monthOffset % 3) * 35000, note: "Weekly groceries", date: groceries });

    const utilities = new Date(date);
    utilities.setDate(10);
    transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Bills and Utilities")!, amountMinor: 320000 + (monthOffset % 2) * 45000, note: "Electricity and internet", date: utilities });

    const dining = new Date(date);
    dining.setDate(14);
    transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Food and Dining")!, amountMinor: 180000 + monthOffset * 12000, note: "Dinner with friends", date: dining });

    const transport = new Date(date);
    transport.setDate(18);
    transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Transport")!, amountMinor: 95000 + monthOffset * 8000, note: "Fuel and local travel", date: transport });

    const shopping = new Date(date);
    shopping.setDate(22);
    transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Shopping")!, amountMinor: 245000 + (monthOffset % 3) * 90000, note: "Household shopping", date: shopping });

    if (monthOffset % 2 === 0) {
      const freelance = new Date(date);
      freelance.setDate(25);
      transactions.push({ type: TransactionType.INCOME, categoryId: categoryMap.get("INCOME:Freelance")!, amountMinor: 1250000, note: "Design freelance project", date: freelance });
    }

    if (monthOffset === 1 || monthOffset === 4) {
      const entertainment = new Date(date);
      entertainment.setDate(27);
      transactions.push({ type: TransactionType.EXPENSE, categoryId: categoryMap.get("EXPENSE:Entertainment")!, amountMinor: 160000, note: "Movies and subscription", date: entertainment });
    }
  }

  await prisma.transaction.createMany({ data: transactions.map((transaction) => ({ ...transaction, userId: demoUser.id })) });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
