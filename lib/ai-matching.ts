import { Supplier, Request } from "@prisma/client";

interface MatchResult {
  supplierId: string;
  supplierName: string;
  score: number;
  reasons: string[];
}

/**
 * AI Matching Algorithm (Mock Implementation)
 * 
 * This simulates an AI-powered matching system that analyzes:
 * 1. Category alignment
 * 2. Keyword matching in skills
 * 3. Supplier rating and experience
 * 4. Verification status
 */
export function calculateMatchScore(
  request: Request,
  supplier: Supplier
): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  const supplierSkills: string[] = supplier.skills
    ? JSON.parse(supplier.skills)
    : [];
  const supplierCategories: string[] = supplier.categories
    ? JSON.parse(supplier.categories)
    : [];

  // 1. Category Match (0-30 points)
  const categoryMatch = supplierCategories.some(
    (cat) => cat.toLowerCase() === request.category.toLowerCase()
  );
  if (categoryMatch) {
    score += 30;
    reasons.push(`Specializes in ${request.category}`);
  } else {
    // Partial category match
    const partialMatch = supplierCategories.some((cat) =>
      cat.toLowerCase().includes(request.category.toLowerCase().slice(0, 4))
    );
    if (partialMatch) {
      score += 15;
      reasons.push("Related category expertise");
    }
  }

  // 2. Keyword Matching (0-35 points)
  const requestWords = extractKeywords(
    `${request.title} ${request.description}`
  );
  const supplierWords = extractKeywords(
    `${supplier.name} ${supplier.description || ""} ${supplierSkills.join(" ")}`
  );

  const matchingKeywords = requestWords.filter((word) =>
    supplierWords.some(
      (sw) => sw.includes(word) || word.includes(sw)
    )
  );

  const keywordScore = Math.min(35, matchingKeywords.length * 7);
  score += keywordScore;

  if (matchingKeywords.length > 0) {
    reasons.push(
      `Matching skills: ${matchingKeywords.slice(0, 3).join(", ")}${
        matchingKeywords.length > 3 ? "..." : ""
      }`
    );
  }

  // 3. Rating Bonus (0-20 points)
  const ratingScore = (supplier.rating / 5) * 20;
  score += ratingScore;
  if (supplier.rating >= 4.5) {
    reasons.push(`Highly rated (${supplier.rating}/5)`);
  } else if (supplier.rating >= 4.0) {
    reasons.push(`Well rated (${supplier.rating}/5)`);
  }

  // 4. Experience Bonus (0-10 points)
  const experienceScore = Math.min(10, supplier.totalJobs / 10);
  score += experienceScore;
  if (supplier.totalJobs >= 100) {
    reasons.push(`Extensive experience (${supplier.totalJobs}+ jobs)`);
  } else if (supplier.totalJobs >= 50) {
    reasons.push(`Experienced (${supplier.totalJobs} jobs)`);
  }

  // 5. Verification Bonus (5 points)
  if (supplier.verified) {
    score += 5;
    reasons.push("Verified supplier");
  }

  // Ensure score is between 0 and 100
  score = Math.round(Math.max(0, Math.min(100, score)));

  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    score,
    reasons,
  };
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can", "need",
    "our", "we", "you", "your", "they", "their", "this", "that", "these",
    "those", "it", "its", "i", "me", "my", "looking", "seeking", "need",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 20);
}

export function rankSuppliers(
  request: Request,
  suppliers: Supplier[]
): MatchResult[] {
  return suppliers
    .map((supplier) => calculateMatchScore(request, supplier))
    .filter((result) => result.score > 20) // Only include relevant matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10 matches
}
