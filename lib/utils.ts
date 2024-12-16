import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { eachDayOfInterval, isSameDay, format, subDays } from "date-fns";
import axios from "axios";
import { client } from "./hono";
import { z } from "zod";
import pLimit from "p-limit";

type user = "AI" | "user";
interface Message {
  sender: user;
  content: string;
}
interface FormData {
  question: string;
  Files: File[];
}

const formSchema = z.array(
  z.object({
    categories: z.array(
      z.object({
        name: z.string(),
        goal: z.number().nullable().optional(),
      }),
    ),
    accounts: z.array(
      z.object({
        name: z.string(),
      }),
    ),
    projects: z.array(
      z.object({
        name: z.string(),
        budget: z.number(),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid date format",
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid date format",
        }),
        description: z.string().optional(),
      }),
    ),
    transactions: z.array(
      z.object({
        amount: z.number(),
        detailsTransactions: z.array(
          z.object({
            name: z.string().nullable(),
            quantity: z.number().nullable(),
            unitPrice: z.number().nullable(),
            amount: z.number(),
            categoryId: z.string().nullable(),
            projectId: z.string().nullable(),
          }),
        ),
        payee: z.string(),
        notes: z.string().nullable(),
        date: z.string(),
        projectId: z.string().nullable().optional(), // Make optional
        accountId: z.string(),
        categoryId: z.string().nullable(),
      }),
    ),
  }),
);

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expenses: number;
  }[],
  startDate: Date,
  endDate: Date,
) {
  if (activeDays.length === 0) return [];

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));

    if (found) {
      return found;
    } else {
      return {
        date: day,
        income: 0,
        expenses: 0,
      };
    }
  });

  return transactionsByDay;
}

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-Us", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function convertAmountFormMiliunits(amount: number) {
  return amount / 1000;
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

type Period = {
  from: string | Date | undefined;
  to: string | Date | undefined;
};

export function formatDateRange(period?: Period) {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    return `${format(defaultFrom, "LLL dd")}-${format(defaultTo, "LLL dd, y")}`;
  }

  if (period.to) {
    return `${format(period.from, "LLL dd")}-${format(period.to, "LLL dd, y")}`;
  }

  return format(period.from, "LLL dd,y");
}

export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = {
    addPrefix: false,
  },
) {
  const result = Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(value / 100);

  if (options.addPrefix && value > 0) {
    return `+${result}`;
  }

  return result;
}

export const formatText = (text: string) => {
  // Replace Heading 3 (### text)
  text = text.replace(/^###\s*(.+)$/gm, "<h3>$1</h3>");

  // Replace Heading 4 (#### text)
  text = text.replace(/^####\s*(.+)$/gm, "<h4>$1</h4>");

  // Replace Bold (**text**)
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Replace Italic (_text_)
  text = text.replace(/_(.*?)_/g, "<em>$1</em>");

  // Replace Links ([text](url))
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Replace Strikethrough (~~text~~)
  text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");

  return text;
};

export const sendAiMessage = async ({
  threadId,
  personaId,
  setThreadId,
  updateLastMessage,
  updateMessage,
  formData,
  message,
  setFormData,
  setIsLoading,
  personaInfo,
}: {
  updateMessage: (message: Message) => void;
  formData: FormData;
  personaInfo: string;
  setFormData: (data: Partial<FormData>) => void;
  threadId: string;
  message?: string;
  updateLastMessage: (content: string) => void;
  setThreadId: (threadId: string) => void;
  setIsLoading: () => void;
  personaId: string;
}) => {
  setIsLoading();
  const formD = new FormData();
  const mss = message ? message : formData.question;
  formD.append("question", mss);
  formD.append("personaInfo", personaInfo);
  formData.Files.forEach((file) => formD.append("file", file));
  formD.append("threadId", threadId);
  const newMessage: Message = {
    sender: "user",
    content: mss,
  };

  updateMessage(newMessage);
  const AIMessage: Message = {
    sender: "AI",
    content: "",
  };
  updateMessage(AIMessage);
  setFormData({ question: "", Files: [] });

  axios
    .post("/api/conversation", formD, {
      headers: {
        "X-Persona-ID": personaId,
      },
    })
    .then((response) => {
      const AIresponse = formatText(response.data.response.output);
      setThreadId(response.data.response.threadId);
      updateLastMessage(AIresponse);
      setIsLoading();
    })
    .catch(
      (err) => {
        updateLastMessage(
          "There was a problem completing your request. Please try again or report the error  manuel@sopmauel.com / sopemmanuel@gmail.com",
        );
        setIsLoading();
      },
      //TODO
    );
};

export async function uploadEntitiesAndReplaceReferences(
  Bigdata: z.infer<typeof formSchema> | string,
  personaId: string,
) {
  if (typeof Bigdata === "string") return Bigdata;
  // Maps to store name-to-ID mappings
  const accountNameToIdMap = new Map();
  const categoryNameToIdMap = new Map();
  const projectNameToIdMap = new Map();
  const projects = [];
  const detailsP = [];
  const limit = pLimit(5);

  let updatedData = [];

  for (const data of Bigdata) {
    // Upload Accounts Concurrently
    const uploadAccountPromises = data.accounts.map((account) =>
      limit(async () => {
        if (accountNameToIdMap.has(account.name)) {
          return; // Skip creation
        }

        const res = await client.api.accounts.$post(
          { json: account },
          {
            headers: {
              "X-Persona-ID": personaId,
            },
          },
        );

        if (res.ok) {
          const { data: response } = await res.json();
          accountNameToIdMap.set(account.name, response.id);
        }
      }),
    );

    // Upload Categories Concurrently
    const uploadCategoryPromises = data.categories.map((category) =>
      limit(async () => {
        if (categoryNameToIdMap.has(category.name)) {
          return; // Skip creation
        }

        const res = await client.api.categories.$post(
          {
            json: {
              ...category,
              goal: category.goal
                ? convertAmountToMiliunits(category.goal)
                : category.goal,
            },
          },
          {
            headers: {
              "X-Persona-ID": personaId,
            },
          },
        );

        if (res.ok) {
          const { data: response } = await res.json();
          categoryNameToIdMap.set(category.name, response.id);
        }
      }),
    );

    const uploadProjectPromises = data.projects.map((project) =>
      limit(async () => {
        if (projectNameToIdMap.has(project.name)) {
          return; // Skip creation
        }

        const res = await client.api.projects.$post(
          {
            json: {
              ...project,
              budget: convertAmountToMiliunits(project.budget),
            },
          },
          {
            headers: {
              "X-Persona-ID": personaId,
            },
          },
        );
        projects.push(project.name);
        if (res.ok) {
          const { data: response } = await res.json();
          projectNameToIdMap.set(project.name, response.id);
        }
      }),
    );

    // Await all uploads
    await Promise.all([
      ...uploadAccountPromises,
      ...uploadCategoryPromises,
      ...uploadProjectPromises,
    ]);

    // Replace accountId in Transactions and Projects
    const replaceAccountIds = () => {
      for (const transaction of data.transactions) {
        const accountName = transaction.accountId; // Current account name
        const accountId = accountNameToIdMap.get(accountName); // Get corresponding ID

        if (accountId) {
          transaction.accountId = accountId; // Replace name with ID
        }
      }
    };

    // Replace categoryId in Transactions and Projects
    const replaceCategoryIds = () => {
      for (const transaction of data.transactions) {
        const categoryName = transaction.categoryId; // Current category name
        const categoryId = categoryNameToIdMap.get(categoryName); // Get corresponding ID

        if (categoryId) {
          transaction.categoryId = categoryId; // Replace name with ID
        }
        if (transaction.detailsTransactions.length > 0) {
          for (const detail of transaction.detailsTransactions) {
            const categoryName = detail.categoryId; // Current category name
            const categoryId = categoryNameToIdMap.get(categoryName); // Get corresponding ID

            if (categoryId) {
              detail.categoryId = categoryId; // Replace name with ID
            }
          }
        }
      }
    };

    const replaceProjectIds = () => {
      for (const transaction of data.transactions) {
        const projectName = transaction.projectId;
        // Current category name
        const projectId = projectNameToIdMap.get(JSON.stringify(projectName));
        // Get corresponding ID

        if (projectName) {
          transaction.projectId = projectId; // Replace name with ID
        } else {
          // Handle missing mapping as needed
        }

        if (transaction.detailsTransactions.length > 0) {
          for (const detail of transaction.detailsTransactions) {
            detailsP.push(detail.projectId);
            const projectName = detail.projectId;
            // Current category name
            const projectId = projectNameToIdMap.get(projectName); // Get corresponding ID

            if (projectName) {
              detail.projectId = projectId; // Replace name with ID
            } else {
              // Handle missing mapping as needed
            }
          }
        }
      }
    };

    // Execute the replacement functions
    replaceAccountIds();
    replaceCategoryIds();
    replaceProjectIds();

    updatedData.push(data);
    // Return the updated data if necessary
  }

  return updatedData;
}

export class MarkdownFormatter {
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private static formatHeaders(text: string): string {
    return text.replace(/^(#{1,6})\s(.+)$/gm, (_, level, content) => {
      const headerLevel = level.length;
      return `<h${headerLevel}>${content.trim()}</h${headerLevel}>`;
    });
  }

  private static formatBoldItalic(text: string): string {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  private static formatLists(text: string): string {
    // Unordered lists
    text = text.replace(/^\s*[-*+]\s+(.+)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

    // Ordered lists
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*<\/li>\n?)+/g, "<ol>$&</ol>");

    return text;
  }

  private static formatLinks(text: string): string {
    return text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }

  private static formatCodeBlocks(text: string): string {
    // Code blocks with language
    text = text.replace(
      /```(\w+)?\n([\s\S]+?)```/g,
      (_, lang, code) =>
        `<pre><code class="language-${lang || "plain"}">${this.escapeHtml(code.trim())}</code></pre>`,
    );

    // Inline code
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    return text;
  }

  private static formatParagraphs(text: string): string {
    return text
      .split("\n\n")
      .map((para) => para.trim())
      .filter((para) => para.length > 0)
      .map((para) => `<p>${para}</p>`)
      .join("\n");
  }

  static toHtml(markdown: string): string {
    let html = markdown.trim();

    // Order matters! Process blocks first, then inline elements
    html = this.formatCodeBlocks(html);
    html = this.formatHeaders(html);
    html = this.formatLists(html);
    html = this.formatBoldItalic(html);
    html = this.formatLinks(html);
    html = this.formatParagraphs(html);

    return html;
  }
}
