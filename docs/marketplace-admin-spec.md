# Second-Hand Marketplace Admin Specification

> Complete Admin System Design for MVP → V2 → V3
> Target Platform: Off-Base Admin (Next.js + Supabase)

---

## Table of Contents

1. [Admin Feature Definition](#1-admin-feature-definition)
2. [User Management](#2-user-management)
3. [Item & Content Moderation](#3-item--content-moderation)
4. [Dispute & Report Handling](#4-dispute--report-handling)
5. [Analytics Dashboard & KPIs](#5-analytics-dashboard--kpis)
6. [Policy & Safety Layer](#6-policy--safety-layer)
7. [Automation / ML / Ops Enhancements](#7-automation--ml--ops-enhancements)
8. [Marketing & Communications](#8-marketing--communications)
9. [Database Schema](#9-database-schema)
10. [API Endpoints](#10-api-endpoints)

---

## 1. Admin Feature Definition

### 1.1 Feature Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MARKETPLACE ADMIN ROADMAP                          │
├─────────────────┬─────────────────────┬─────────────────────────────────────┤
│      MVP        │         V2          │                V3                   │
├─────────────────┼─────────────────────┼─────────────────────────────────────┤
│ • Item CRUD     │ • Auto-moderation   │ • ML fraud detection                │
│ • User mgmt     │ • Risk scoring      │ • Recommendation engine             │
│ • Basic reports │ • Advanced analytics│ • Automated CS triage               │
│ • Manual review │ • Keyword flagging  │ • Predictive health metrics         │
│ • Chat monitor  │ • Image moderation  │ • A/B testing framework             │
│ • Transactions  │ • Dispute workflow  │ • Dynamic pricing insights          │
│ • Basic stats   │ • Bulk operations   │ • Seller performance scoring        │
└─────────────────┴─────────────────────┴─────────────────────────────────────┘
```

### 1.2 MVP Features

#### 1.2.1 Item Management

| Field | Description |
|-------|-------------|
| **Feature ID** | `MVP-ITEM-001` |
| **Name** | Item Listing Management |
| **Description** | CRUD operations for marketplace items with approval workflow |
| **Operational Purpose** | Enable admins to review, approve, edit, or remove item listings |

**Real-World Usage Scenarios:**
1. New seller posts item → Admin reviews for policy compliance → Approve/Reject
2. User reports item → Admin investigates → Hide/Delete if violating
3. Seller updates price → Auto-approved (no content change)
4. Admin spots scam pattern → Bulk hide related items

**Required Data Fields:**

```typescript
interface MarketplaceItem {
  // Core fields
  id: string;                          // UUID
  seller_id: string;                   // FK to users
  title: string;                       // max 100 chars
  description: string;                 // max 5000 chars
  price: number;                       // in KRW, min 0
  currency: 'KRW' | 'USD';

  // Categorization
  category_id: string;                 // FK to categories
  subcategory_id: string | null;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

  // Location
  location_type: 'HUMPREYS' | 'OSAN' | 'BOTH';
  meetup_location: string | null;      // preferred meetup spot
  shipping_available: boolean;

  // Status
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SOLD' | 'RESERVED' | 'HIDDEN' | 'DELETED';
  moderation_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  rejection_reason: string | null;

  // Metadata
  view_count: number;
  favorite_count: number;
  inquiry_count: number;
  is_featured: boolean;
  is_negotiable: boolean;
  is_urgent: boolean;                  // seller wants quick sale

  // Timestamps
  created_at: timestamp;
  updated_at: timestamp;
  approved_at: timestamp | null;
  sold_at: timestamp | null;
  expires_at: timestamp | null;        // auto-expire after 30 days
}
```

**UI Layout - Item List Page:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Items Management                                              [+ Add Item]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Filters:                                                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│ │ Status ▼ │ │Category ▼│ │Location ▼│ │Mod Status│ │ Search...        🔍│ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
│                                                                             │
│ Quick Stats: [Pending: 23] [Active: 1,245] [Flagged: 12] [Today: 45]       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ☑ │ Image │ Title          │ Seller    │ Price    │ Status  │ Mod    │ Act │
├───┼───────┼────────────────┼───────────┼──────────┼─────────┼────────┼─────┤
│ ☐ │ [img] │ iPhone 14 Pro  │ john_doe  │ ₩800,000 │ ACTIVE  │APPROVED│ ••• │
│ ☐ │ [img] │ Nike Air Max   │ jane_s    │ ₩120,000 │ PENDING │PENDING │ ••• │
│ ☐ │ [img] │ PS5 Console    │ gamer123  │ ₩450,000 │ FLAGGED │FLAGGED │ ••• │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bulk Actions: [Approve] [Reject] [Hide] [Delete]    │ Page 1 of 52 │ < > │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Table Columns:**
| Column | Sortable | Width | Description |
|--------|----------|-------|-------------|
| Checkbox | No | 40px | Bulk selection |
| Image | No | 60px | Thumbnail |
| Title | Yes | 200px | Item title (truncated) |
| Seller | Yes | 120px | Username + link to profile |
| Price | Yes | 100px | Formatted with currency |
| Status | Yes | 80px | Badge with color |
| Mod Status | Yes | 80px | Moderation badge |
| Actions | No | 60px | Dropdown menu |

**Actions Menu:**
- View Details
- Edit Item
- Approve / Reject
- Hide / Unhide
- Delete
- View Seller Profile
- View Reports (if any)

**Error & Exception Cases:**

| Error Case | Trigger | Admin Action | System Response |
|------------|---------|--------------|-----------------|
| Duplicate listing | Same images + similar title from same seller | Merge or delete | Flag for review |
| Price manipulation | Price changed >50% within 24h | Review for bait-and-switch | Auto-flag |
| Expired listing | 30+ days without renewal | Auto-hide | Notify seller |
| Missing images | Item has no images | Block approval | Require images |
| Prohibited content | Title/description contains blocked words | Auto-reject | Log + notify |
| Seller suspended | Item belongs to suspended user | Auto-hide all items | Queue for review |

---

#### 1.2.2 User Management (Marketplace)

| Field | Description |
|-------|-------------|
| **Feature ID** | `MVP-USER-001` |
| **Name** | Marketplace User Management |
| **Description** | Manage marketplace participants with trust scoring |
| **Operational Purpose** | Maintain platform integrity by managing seller/buyer accounts |

**Real-World Usage Scenarios:**
1. New user registers → Default ACTIVE status → Can buy immediately, sell after verification
2. User receives 3 reports in 7 days → Auto-restrict → Admin reviews
3. Seller completes 10 transactions with 4.5+ rating → Verified badge
4. User requests account deletion → Admin processes → Data anonymized

**Additional User Fields (extend existing users table):**

```typescript
interface MarketplaceUserProfile {
  user_id: string;                     // FK to users

  // Marketplace status
  marketplace_status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED' | 'BANNED';
  can_sell: boolean;
  can_buy: boolean;
  can_message: boolean;

  // Trust & Reputation
  seller_rating: number | null;        // 1.0 - 5.0
  buyer_rating: number | null;
  total_sales: number;
  total_purchases: number;
  completed_transactions: number;
  cancelled_transactions: number;

  // Verification
  is_verified_seller: boolean;
  verified_at: timestamp | null;
  verification_method: 'PHONE' | 'ID' | 'BANK' | null;

  // Risk & Moderation
  risk_score: number;                  // 0-100, higher = riskier
  report_count: number;
  warning_count: number;
  last_warning_at: timestamp | null;
  restriction_reason: string | null;
  restricted_until: timestamp | null;

  // Activity
  last_listing_at: timestamp | null;
  last_purchase_at: timestamp | null;
  response_rate: number;               // % of inquiries responded to
  avg_response_time: number;           // in minutes
}
```

**UI Layout - User Detail (Marketplace Tab):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ User: john_doe                                    [Edit] [Actions ▼]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  Name: John Doe           Status: ● ACTIVE                  │
│ │             │  Email: john@email.com    Member Since: Jan 2024            │
│ │   [Avatar]  │  Phone: +82-10-1234-5678  Last Active: 2 hours ago          │
│ │             │  Location: Camp Humphreys                                   │
│ └─────────────┘  Verified: ✓ Phone, ✓ ID                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Listings] [Transactions] [Reviews] [Reports] [Messages] [Logs] │
├─────────────────────────────────────────────────────────────────────────────┤
│                              MARKETPLACE STATS                              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│ │ Seller Rating │ │ Total Sales   │ │ Response Rate │ │ Risk Score    │    │
│ │    ⭐ 4.8     │ │     47        │ │     94%       │ │    12/100     │    │
│ │   (32 reviews)│ │  ₩2.4M value  │ │   ~15 min avg │ │    LOW        │    │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                                             │
│ MODERATION HISTORY                                                          │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Date       │ Action        │ Reason              │ Admin    │ Status  │  │
│ ├────────────┼───────────────┼─────────────────────┼──────────┼─────────┤  │
│ │ 2024-01-15 │ Warning       │ Late shipping       │ admin_1  │ Resolved│  │
│ │ 2024-01-10 │ Report        │ Item not as desc    │ auto     │ Cleared │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ QUICK ACTIONS                                                               │
│ [Send Warning] [Restrict Account] [Suspend] [Ban] [Reset Risk Score]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1.2.3 Transaction Management

| Field | Description |
|-------|-------------|
| **Feature ID** | `MVP-TXN-001` |
| **Name** | Transaction Oversight |
| **Description** | Monitor and manage all marketplace transactions |
| **Operational Purpose** | Ensure smooth transactions, handle disputes, track platform GMV |

**Data Structure:**

```typescript
interface MarketplaceTransaction {
  id: string;
  item_id: string;
  seller_id: string;
  buyer_id: string;

  // Pricing
  listing_price: number;
  final_price: number;
  platform_fee: number;               // if commission model
  fee_percentage: number;

  // Status flow
  status: 'INITIATED' | 'AGREED' | 'PAYMENT_PENDING' | 'PAID' |
          'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' |
          'DISPUTED' | 'REFUNDED';

  // Payment (if integrated)
  payment_method: 'CASH' | 'TRANSFER' | 'ESCROW' | 'EXTERNAL' | null;
  payment_reference: string | null;
  paid_at: timestamp | null;

  // Delivery
  delivery_method: 'MEETUP' | 'SHIPPING' | 'PICKUP';
  meetup_location: string | null;
  meetup_time: timestamp | null;
  tracking_number: string | null;
  shipped_at: timestamp | null;
  delivered_at: timestamp | null;

  // Completion
  completed_at: timestamp | null;
  cancelled_at: timestamp | null;
  cancellation_reason: string | null;
  cancelled_by: 'BUYER' | 'SELLER' | 'ADMIN' | 'SYSTEM' | null;

  // Dispute
  has_dispute: boolean;
  dispute_id: string | null;

  // Timestamps
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Transaction Status Flow:**

```
                                    ┌─────────────┐
                                    │  CANCELLED  │
                                    └──────▲──────┘
                                           │ (any stage)
┌───────────┐    ┌─────────┐    ┌─────────┴───────┐    ┌────────────┐
│ INITIATED │───▶│ AGREED  │───▶│PAYMENT_PENDING  │───▶│    PAID    │
└───────────┘    └─────────┘    └─────────────────┘    └─────┬──────┘
                                                              │
                              ┌────────────────────────────────┘
                              ▼
                    ┌─────────────────┐         ┌───────────────┐
                    │    SHIPPED      │────────▶│   DELIVERED   │
                    │ (if shipping)   │         └───────┬───────┘
                    └─────────────────┘                 │
                              │                         │
                              │ (if meetup)             │
                              ▼                         ▼
                    ┌─────────────────┐         ┌───────────────┐
                    │   COMPLETED     │◀────────│   (confirm)   │
                    └────────┬────────┘         └───────────────┘
                             │
                             │ (if issue)
                             ▼
                    ┌─────────────────┐         ┌───────────────┐
                    │    DISPUTED     │────────▶│   REFUNDED    │
                    └─────────────────┘         └───────────────┘
```

**UI Layout - Transaction List:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Transactions                                               [Export CSV]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Date Range: [Last 7 days ▼]  Status: [All ▼]  Amount: [₩____] to [₩____]  │
│                                                                             │
│ Summary: Total: 234 │ GMV: ₩45.2M │ Fees: ₩2.26M │ Disputed: 3 │ Avg: ₩193K│
├─────────────────────────────────────────────────────────────────────────────┤
│ ID     │ Item           │ Seller   │ Buyer    │ Amount   │ Status    │ Date│
├────────┼────────────────┼──────────┼──────────┼──────────┼───────────┼─────┤
│ TXN001 │ iPhone 14 Pro  │ john_doe │ buyer123 │ ₩800,000 │ COMPLETED │ 1/20│
│ TXN002 │ Nike Air Max   │ jane_s   │ shopper  │ ₩120,000 │ SHIPPED   │ 1/20│
│ TXN003 │ PS5 Console    │ gamer123 │ player1  │ ₩450,000 │ DISPUTED  │ 1/19│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1.2.4 Chat Monitoring

| Field | Description |
|-------|-------------|
| **Feature ID** | `MVP-CHAT-001` |
| **Name** | Chat Room Monitoring |
| **Description** | Monitor buyer-seller communications for policy violations |
| **Operational Purpose** | Prevent fraud, scams, harassment, and off-platform transactions |

**Data Structure:**

```typescript
interface ChatRoom {
  id: string;
  item_id: string;
  seller_id: string;
  buyer_id: string;

  // Status
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  is_flagged: boolean;
  flag_reason: string | null;

  // Metadata
  message_count: number;
  last_message_at: timestamp;
  created_at: timestamp;
}

interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;

  // Content
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'LOCATION' | 'OFFER' | 'SYSTEM';

  // Moderation
  is_flagged: boolean;
  flag_reason: string | null;
  is_hidden: boolean;
  hidden_by: string | null;

  // Status
  is_read: boolean;
  read_at: timestamp | null;

  created_at: timestamp;
}
```

**Auto-Flag Triggers (MVP - keyword based):**

| Trigger | Keywords/Patterns | Risk Level | Action |
|---------|-------------------|------------|--------|
| Off-platform payment | "venmo", "paypal", "zelle", "cash app", "계좌이체" | HIGH | Flag + Alert |
| Phone number sharing | `\d{3}[-.\s]?\d{4}[-.\s]?\d{4}` pattern | MEDIUM | Flag |
| External contact | "카톡", "kakao", "whatsapp", "line" | MEDIUM | Flag |
| Harassment | Predefined list of slurs/threats | HIGH | Flag + Hide |
| Scam patterns | "send money first", "wire transfer", "gift card" | HIGH | Flag + Alert |

**UI Layout - Chat Monitor:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Chat Monitoring                                    [Flagged Only: ☑]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ FLAGGED CONVERSATIONS       │ │ Conversation: TXN-12345                 │ │
│ │                             │ │ Item: iPhone 14 Pro (₩800,000)          │ │
│ │ 🚩 john_doe ↔ scammer123    │ │ Seller: john_doe | Buyer: buyer123      │ │
│ │    "send money first..."    │ ├─────────────────────────────────────────┤ │
│ │    ⚠️ HIGH RISK | 2 min ago  │ │                                         │ │
│ │                             │ │ [john_doe] 10:30 AM                     │ │
│ │ 🚩 seller99 ↔ buyer88       │ │ Hi, is this still available?            │ │
│ │    Phone number detected    │ │                                         │ │
│ │    ⚡ MEDIUM | 15 min ago    │ │ [buyer123] 10:32 AM                     │ │
│ │                             │ │ Yes! Are you interested?                │ │
│ │ 🚩 user_a ↔ user_b          │ │                                         │ │
│ │    Harassment detected      │ │ [john_doe] 10:35 AM                     │ │
│ │    🔴 HIGH RISK | 1 hr ago   │ │ 🚩 Can you send money first to         │ │
│ │                             │ │    my account? 123-456-789              │ │
│ └─────────────────────────────┘ │                                         │ │
│                                 ├─────────────────────────────────────────┤ │
│                                 │ Actions: [Warn User] [Hide Message]     │ │
│                                 │          [Block Chat] [Escalate]        │ │
│                                 └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1.2.5 Report Queue

| Field | Description |
|-------|-------------|
| **Feature ID** | `MVP-RPT-001` |
| **Name** | Report Management Queue |
| **Description** | Centralized queue for all user-submitted reports |
| **Operational Purpose** | Efficiently triage and resolve user complaints |

**Data Structure:**

```typescript
interface MarketplaceReport {
  id: string;

  // Reporter
  reporter_id: string;
  reporter_type: 'BUYER' | 'SELLER' | 'VIEWER';

  // Target
  target_type: 'ITEM' | 'USER' | 'CHAT' | 'TRANSACTION' | 'REVIEW';
  target_id: string;

  // Report details
  category: 'FRAUD' | 'COUNTERFEIT' | 'PROHIBITED' | 'HARASSMENT' |
            'SPAM' | 'MISREPRESENTATION' | 'NO_SHOW' | 'PRICE_GOUGING' | 'OTHER';
  subcategory: string | null;
  description: string;
  evidence_urls: string[];            // screenshots, photos

  // Status
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Resolution
  assigned_to: string | null;         // admin id
  resolution: string | null;
  action_taken: 'NONE' | 'WARNING' | 'CONTENT_REMOVED' | 'USER_RESTRICTED' |
                'USER_SUSPENDED' | 'USER_BANNED' | 'REFUND_ISSUED';
  resolved_by: string | null;
  resolved_at: timestamp | null;

  // Metadata
  is_duplicate: boolean;
  duplicate_of: string | null;
  auto_flagged: boolean;

  created_at: timestamp;
  updated_at: timestamp;
}
```

**UI Layout - Report Queue:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Report Queue                                           [My Queue: 12]       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Priority: [All ▼]  Category: [All ▼]  Status: [Pending ▼]  Assigned: [All ▼]│
├─────────────────────────────────────────────────────────────────────────────┤
│ │ SLA Status: 🟢 On Track: 45 │ 🟡 At Risk: 8 │ 🔴 Breached: 2 │           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔴│ RPT-1234 │ FRAUD      │ iPhone listing   │ URGENT │ Unassigned │ 2h ago│
│ 🟡│ RPT-1235 │ HARASSMENT │ Chat message     │ HIGH   │ admin_1    │ 4h ago│
│ 🟢│ RPT-1236 │ SPAM       │ User profile     │ MEDIUM │ admin_2    │ 6h ago│
│ ⚪│ RPT-1237 │ OTHER      │ Transaction      │ LOW    │ Unassigned │ 1d ago│
├─────────────────────────────────────────────────────────────────────────────┤
│ Click to expand report details...                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Report: RPT-1234                                       [Assign to Me]   │ │
│ │ Category: FRAUD | Priority: URGENT | Status: PENDING                    │ │
│ │                                                                         │ │
│ │ Reporter: buyer123 (verified, 2 prev reports, 1 valid)                  │ │
│ │ Target: Item #ITM-5678 by seller_scam                                   │ │
│ │                                                                         │ │
│ │ Description:                                                            │ │
│ │ "Seller asked me to send money via Zelle before meeting.                │ │
│ │  When I refused, they became aggressive and threatened me."             │ │
│ │                                                                         │ │
│ │ Evidence: [img1.jpg] [img2.jpg] [screenshot.png]                        │ │
│ │                                                                         │ │
│ │ Related:                                                                │ │
│ │ • 2 other reports against this seller in past 7 days                    │ │
│ │ • Seller risk score: 78/100 (HIGH)                                      │ │
│ │                                                                         │ │
│ │ Actions: [Warn Seller] [Hide Item] [Suspend Seller] [Dismiss Report]    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**SLA Definitions:**

| Priority | Response Time | Resolution Time | Escalation After |
|----------|---------------|-----------------|------------------|
| URGENT | 30 min | 4 hours | 1 hour |
| HIGH | 2 hours | 24 hours | 4 hours |
| MEDIUM | 8 hours | 72 hours | 24 hours |
| LOW | 24 hours | 7 days | 72 hours |

---

#### 1.2.6 Basic Statistics Dashboard

| Field | Description |
|-------|-------------|
| **Feature ID** | `MVP-STAT-001` |
| **Name** | Basic Analytics Dashboard |
| **Description** | Overview of key marketplace metrics |
| **Operational Purpose** | Monitor marketplace health and identify trends |

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Marketplace Dashboard                              [Today] [7d] [30d] [All] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ Active Listings │ │ New Listings    │ │ Transactions    │ │ GMV (30d)   │ │
│ │     1,245       │ │      45         │ │      234        │ │  ₩45.2M     │ │
│ │   ↑ 12% vs 7d   │ │   ↓ 5% vs 7d    │ │   ↑ 8% vs 7d    │ │  ↑ 15% vs 7d│ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ Active Users    │ │ Pending Reviews │ │ Open Reports    │ │ Disputes    │ │
│ │     892         │ │      23         │ │      12         │ │      3      │ │
│ │   ↑ 3% vs 7d    │ │   ⚠️ 5 urgent   │ │   🔴 2 SLA breach│ │  ↓ 2 vs 7d  │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                                             │
│ ┌──────────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ Listings by Category                 │ │ Recent Activity                │ │
│ │ ████████████████ Electronics (342)   │ │ • john_doe listed iPhone 14    │ │
│ │ ████████████ Clothing (256)          │ │ • buyer123 completed purchase  │ │
│ │ ████████ Home (198)                  │ │ • Report #1234 escalated       │ │
│ │ ██████ Sports (145)                  │ │ • seller99 account suspended   │ │
│ │ ████ Other (304)                     │ │ • New user: mike_smith         │ │
│ └──────────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                             │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ Transaction Trend (Last 30 Days)                                         ││
│ │  250 ┤                                                         ╭─────    ││
│ │  200 ┤                              ╭────╮         ╭───╮      ╭╯         ││
│ │  150 ┤      ╭────╮    ╭────────────╯    ╰────────╯   ╰────╯             ││
│ │  100 ┤─────╯    ╰────╯                                                   ││
│ │   50 ┤                                                                   ││
│ │    0 └────────────────────────────────────────────────────────────────   ││
│ │        1    5    10   15   20   25   30                                  ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.3 V2 Features

#### 1.3.1 Auto-Moderation System

| Field | Description |
|-------|-------------|
| **Feature ID** | `V2-MOD-001` |
| **Name** | Automated Content Moderation |
| **Description** | AI-assisted moderation for text and images |
| **Operational Purpose** | Reduce manual review load, faster response to violations |

**Components:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTO-MODERATION PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  New Content ──▶ [Text Analysis] ──▶ [Image Analysis] ──▶ [Risk Score]     │
│       │               │                    │                   │            │
│       │               ▼                    ▼                   ▼            │
│       │         ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│       │         │ • Keywords  │    │ • NSFW      │    │ Score: 0-100│      │
│       │         │ • Patterns  │    │ • Objects   │    │             │      │
│       │         │ • Sentiment │    │ • Text OCR  │    │ < 30: Auto  │      │
│       │         │ • Language  │    │ • Duplicates│    │      Approve│      │
│       │         └─────────────┘    └─────────────┘    │             │      │
│       │                                               │ 30-70: Queue│      │
│       │                                               │             │      │
│       │                                               │ > 70: Auto  │      │
│       │                                               │      Flag   │      │
│       │                                               └─────────────┘      │
│       │                                                      │              │
│       └──────────────────────────────────────────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Keyword Categories:**

```typescript
interface ModerationRules {
  prohibited_keywords: {
    category: string;
    keywords: string[];
    action: 'BLOCK' | 'FLAG' | 'WARN';
    weight: number;  // contribution to risk score
  }[];

  suspicious_patterns: {
    pattern: RegExp;
    description: string;
    action: 'FLAG' | 'WARN';
    weight: number;
  }[];
}

// Example configuration
const moderationConfig: ModerationRules = {
  prohibited_keywords: [
    { category: 'weapons', keywords: ['gun', 'firearm', 'ammunition', '총', '탄약'], action: 'BLOCK', weight: 100 },
    { category: 'drugs', keywords: ['marijuana', 'cocaine', 'pills', '마약'], action: 'BLOCK', weight: 100 },
    { category: 'counterfeit', keywords: ['replica', 'fake', '1:1', 'AAA quality', '짝퉁'], action: 'FLAG', weight: 50 },
    { category: 'scam', keywords: ['send money first', 'wire transfer', 'gift card payment'], action: 'FLAG', weight: 70 },
  ],
  suspicious_patterns: [
    { pattern: /\d{3}[-.\s]?\d{4}[-.\s]?\d{4}/, description: 'Phone number in listing', action: 'FLAG', weight: 20 },
    { pattern: /[@#]\w+/, description: 'Social media handle', action: 'WARN', weight: 10 },
  ]
};
```

**Admin Configuration UI:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Auto-Moderation Settings                                    [Save Changes] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ RISK SCORE THRESHOLDS                                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Auto-Approve Below:  [30 ▼]    (items with score < 30 go live)         │ │
│ │ Manual Review Range: [30] to [70]                                       │ │
│ │ Auto-Flag Above:     [70 ▼]    (items with score > 70 hidden)          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ KEYWORD RULES                                                [+ Add Rule]  │
│ ┌───────────┬─────────────────────────────────┬────────┬────────┬────────┐ │
│ │ Category  │ Keywords                        │ Action │ Weight │ Status │ │
│ ├───────────┼─────────────────────────────────┼────────┼────────┼────────┤ │
│ │ Weapons   │ gun, firearm, ammunition, 총... │ BLOCK  │ 100    │ Active │ │
│ │ Drugs     │ marijuana, cocaine, pills, 마...│ BLOCK  │ 100    │ Active │ │
│ │ Counterfeit│ replica, fake, 1:1, AAA qual...│ FLAG   │ 50     │ Active │ │
│ │ Scam      │ send money first, wire trans...│ FLAG   │ 70     │ Active │ │
│ └───────────┴─────────────────────────────────┴────────┴────────┴────────┘ │
│                                                                             │
│ IMAGE MODERATION                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ☑ Enable NSFW Detection          Threshold: [0.8 ▼]                    │ │
│ │ ☑ Enable Duplicate Detection     Similarity: [0.95 ▼]                  │ │
│ │ ☐ Enable Object Detection        (detect prohibited items in images)    │ │
│ │ ☑ Enable Text Extraction (OCR)   (scan text in images for violations)  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1.3.2 Advanced Analytics

| Field | Description |
|-------|-------------|
| **Feature ID** | `V2-ANALYTICS-001` |
| **Name** | Advanced Analytics Dashboard |
| **Description** | Deep insights into marketplace performance |
| **Operational Purpose** | Data-driven decision making for ops and business |

**Additional Metrics:**

| Metric | Formula | Frequency |
|--------|---------|-----------|
| Conversion Rate | Transactions / Unique Item Views | Daily |
| Sell-Through Rate | Items Sold / Items Listed (period) | Weekly |
| Average Days to Sell | Avg(sold_at - created_at) | Weekly |
| Repeat Seller Rate | Sellers with 2+ listings / Total Sellers | Monthly |
| Buyer Retention | Buyers with 2+ purchases / Total Buyers | Monthly |
| Category GMV Share | Category GMV / Total GMV | Daily |
| Fraud Rate | Confirmed Fraud Reports / Total Transactions | Weekly |

---

#### 1.3.3 Dispute Resolution Workflow

| Field | Description |
|-------|-------------|
| **Feature ID** | `V2-DISPUTE-001` |
| **Name** | Structured Dispute Resolution |
| **Description** | Step-by-step dispute handling with evidence collection |
| **Operational Purpose** | Fair, consistent, documented dispute resolution |

*Detailed in Section 4*

---

#### 1.3.4 Bulk Operations

| Field | Description |
|-------|-------------|
| **Feature ID** | `V2-BULK-001` |
| **Name** | Bulk Item & User Operations |
| **Description** | Mass actions on items and users |
| **Operational Purpose** | Efficient handling of spam waves, policy updates |

**Supported Bulk Actions:**

| Target | Actions | Max Selection |
|--------|---------|---------------|
| Items | Approve, Reject, Hide, Delete, Change Category, Feature | 100 |
| Users | Warn, Restrict, Suspend, Ban, Reset Risk Score | 50 |
| Reports | Assign, Resolve, Dismiss, Escalate | 100 |
| Messages | Hide, Flag, Unflag | 200 |

---

### 1.4 V3 Features

#### 1.4.1 ML-Based Fraud Detection

| Field | Description |
|-------|-------------|
| **Feature ID** | `V3-FRAUD-001` |
| **Name** | Machine Learning Fraud Detection |
| **Description** | Predictive fraud scoring using ML models |
| **Operational Purpose** | Proactive fraud prevention, reduced losses |

**Feature Inputs:**

```typescript
interface FraudDetectionFeatures {
  // User behavior
  account_age_days: number;
  listing_velocity: number;           // listings per day
  price_deviation: number;            // vs category average
  response_time_avg: number;
  cancellation_rate: number;

  // Content signals
  image_quality_score: number;
  description_length: number;
  has_stock_images: boolean;
  duplicate_image_count: number;

  // Transaction patterns
  same_buyer_rate: number;            // % transactions with same buyer
  off_platform_mention_count: number;
  payment_method_changes: number;

  // Network signals
  shared_device_users: number;
  shared_ip_users: number;
  linked_account_risk: number;
}
```

---

#### 1.4.2 Recommendation Engine Admin

| Field | Description |
|-------|-------------|
| **Feature ID** | `V3-REC-001` |
| **Name** | Recommendation System Management |
| **Description** | Configure and monitor recommendation algorithms |
| **Operational Purpose** | Optimize discovery, increase engagement and sales |

**Configuration Options:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Recommendation Settings                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ALGORITHM WEIGHTS                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Relevance (content similarity)    ████████░░░░░░░░░░░░  40%            │ │
│ │ Recency (newer items)             ██████░░░░░░░░░░░░░░  30%            │ │
│ │ Popularity (views, favorites)     ████░░░░░░░░░░░░░░░░  20%            │ │
│ │ Seller Rating                     ██░░░░░░░░░░░░░░░░░░  10%            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ FEATURED ITEMS                                            [+ Add Featured] │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Priority │ Item                    │ Position    │ Start    │ End      │ │
│ ├──────────┼─────────────────────────┼─────────────┼──────────┼──────────┤ │
│ │ 1        │ iPhone 14 Pro           │ Home Banner │ Jan 20   │ Jan 27   │ │
│ │ 2        │ Nike Collection         │ Category Top│ Jan 15   │ Feb 15   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ A/B TESTS                                                  [+ New Test]    │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Test Name              │ Variants  │ Traffic │ Metric    │ Status      │ │
│ ├────────────────────────┼───────────┼─────────┼───────────┼─────────────┤ │
│ │ Home Layout v2         │ Control/B │ 50/50   │ CTR       │ Running     │ │
│ │ Price Sort Default     │ A/B/C     │ 33/33/33│ Conversion│ Completed   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1.4.3 Automated CS Triage

| Field | Description |
|-------|-------------|
| **Feature ID** | `V3-CS-001` |
| **Name** | AI-Powered CS Triage |
| **Description** | Automatic categorization and routing of support requests |
| **Operational Purpose** | Faster response times, appropriate skill matching |

**Triage Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CS TRIAGE PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Incoming     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  Request  ───▶│   Classify   │───▶│   Prioritize │───▶│    Route     │     │
│               └──────────────┘    └──────────────┘    └──────────────┘     │
│                      │                   │                   │              │
│                      ▼                   ▼                   ▼              │
│               ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│               │ • Account    │    │ • Urgency    │    │ • Tier 1     │     │
│               │ • Transaction│    │ • Impact     │    │ • Tier 2     │     │
│               │ • Technical  │    │ • Sentiment  │    │ • Specialist │     │
│               │ • Dispute    │    │ • VIP status │    │ • Escalation │     │
│               │ • General    │    │              │    │              │     │
│               └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                             │
│  Auto-Response for common queries:                                          │
│  • Password reset                                                           │
│  • Transaction status                                                       │
│  • How to list an item                                                      │
│  • Shipping information                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Management

### 2.1 User Status Definitions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER STATUS MATRIX                                │
├─────────────┬───────────┬───────────┬───────────┬───────────────────────────┤
│   Status    │ Can Sell  │ Can Buy   │Can Message│ Description               │
├─────────────┼───────────┼───────────┼───────────┼───────────────────────────┤
│ ACTIVE      │    ✓      │    ✓      │    ✓      │ Full platform access      │
│ RESTRICTED  │    ✗      │    ✓      │    ⚠️     │ Cannot create new listings│
│ SUSPENDED   │    ✗      │    ✗      │    ✗      │ Temporary full block      │
│ BANNED      │    ✗      │    ✗      │    ✗      │ Permanent removal         │
├─────────────┴───────────┴───────────┴───────────┴───────────────────────────┤
│ ⚠️ = Limited (can respond to existing conversations only)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Status Transition Rules

```typescript
interface StatusTransition {
  from: UserStatus;
  to: UserStatus;
  allowed_by: ('SYSTEM' | 'ADMIN' | 'SUPER_ADMIN')[];
  requires_reason: boolean;
  reversible: boolean;
  notification: boolean;
}

const transitions: StatusTransition[] = [
  // ACTIVE transitions
  { from: 'ACTIVE', to: 'RESTRICTED', allowed_by: ['SYSTEM', 'ADMIN'], requires_reason: true, reversible: true, notification: true },
  { from: 'ACTIVE', to: 'SUSPENDED', allowed_by: ['ADMIN', 'SUPER_ADMIN'], requires_reason: true, reversible: true, notification: true },
  { from: 'ACTIVE', to: 'BANNED', allowed_by: ['SUPER_ADMIN'], requires_reason: true, reversible: false, notification: true },

  // RESTRICTED transitions
  { from: 'RESTRICTED', to: 'ACTIVE', allowed_by: ['ADMIN', 'SUPER_ADMIN'], requires_reason: false, reversible: true, notification: true },
  { from: 'RESTRICTED', to: 'SUSPENDED', allowed_by: ['ADMIN', 'SUPER_ADMIN'], requires_reason: true, reversible: true, notification: true },
  { from: 'RESTRICTED', to: 'BANNED', allowed_by: ['SUPER_ADMIN'], requires_reason: true, reversible: false, notification: true },

  // SUSPENDED transitions
  { from: 'SUSPENDED', to: 'ACTIVE', allowed_by: ['ADMIN', 'SUPER_ADMIN'], requires_reason: false, reversible: true, notification: true },
  { from: 'SUSPENDED', to: 'RESTRICTED', allowed_by: ['ADMIN', 'SUPER_ADMIN'], requires_reason: false, reversible: true, notification: true },
  { from: 'SUSPENDED', to: 'BANNED', allowed_by: ['SUPER_ADMIN'], requires_reason: true, reversible: false, notification: true },

  // BANNED - no outbound transitions (permanent)
];
```

### 2.3 Enforcement Triggers

#### Automatic Triggers (System)

| Trigger | Condition | Action | Notification |
|---------|-----------|--------|--------------|
| Report threshold | 3+ valid reports in 7 days | RESTRICT | Email + In-app |
| Fraud detection | Risk score > 85 | RESTRICT | Email |
| Spam detection | 10+ identical listings in 24h | RESTRICT | In-app |
| Payment failure | 3+ failed transactions | RESTRICT (buying) | Email |
| Inactive warning | No activity for 60 days | Warning email | Email |
| Scam keywords | High-confidence scam detected | SUSPEND (temp) | Email + Admin alert |

#### Manual Triggers (Admin)

| Trigger | Evidence Required | Approval | Appeal Period |
|---------|-------------------|----------|---------------|
| Policy violation | Report + Admin notes | Admin | 7 days |
| Harassment | Chat logs | Admin | 7 days |
| Fraud confirmed | Transaction evidence | Super Admin | 14 days |
| Legal request | Official document | Super Admin | N/A |
| Repeat offender | 3+ warnings in 30 days | Admin | 3 days |

### 2.4 Moderation Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER MODERATION WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────┐                                                             │
│    │  REPORT  │ ◀─── User submits report                                    │
│    │ RECEIVED │      System auto-flags                                      │
│    └────┬─────┘                                                             │
│         │                                                                   │
│         ▼                                                                   │
│    ┌──────────┐                                                             │
│    │  TRIAGE  │ • Assign priority (URGENT/HIGH/MEDIUM/LOW)                  │
│    │          │ • Check for duplicates                                      │
│    │          │ • Auto-categorize                                           │
│    └────┬─────┘                                                             │
│         │                                                                   │
│         ▼                                                                   │
│    ┌──────────┐                                                             │
│    │  REVIEW  │ • Gather evidence (chat logs, item history, reports)       │
│    │          │ • Check user history                                        │
│    │          │ • Verify claims                                             │
│    └────┬─────┘                                                             │
│         │                                                                   │
│         ├─────────────────┬─────────────────┬─────────────────┐             │
│         ▼                 ▼                 ▼                 ▼             │
│    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐         │
│    │ DISMISS  │     │ WARNING  │     │ RESTRICT │     │ SUSPEND/ │         │
│    │          │     │          │     │          │     │   BAN    │         │
│    └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘         │
│         │                │                │                │               │
│         ▼                ▼                ▼                ▼               │
│    ┌──────────────────────────────────────────────────────────────┐        │
│    │                        ACTION                                 │        │
│    │ • Update user status                                          │        │
│    │ • Send notification                                           │        │
│    │ • Log action with reason                                      │        │
│    │ • Update reporter on outcome                                  │        │
│    └──────────────────────────────────────────────────────────────┘        │
│         │                                                                   │
│         ▼                                                                   │
│    ┌──────────┐                                                             │
│    │  NOTES   │ • Document decision rationale                               │
│    │          │ • Attach evidence                                           │
│    │          │ • Set review date (if temporary)                            │
│    └──────────┘                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Warning System

```typescript
interface UserWarning {
  id: string;
  user_id: string;

  // Warning details
  type: 'POLICY_VIOLATION' | 'BEHAVIOR' | 'CONTENT' | 'FRAUD_RISK' | 'SPAM';
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  message: string;

  // Evidence
  related_report_id: string | null;
  related_item_id: string | null;
  related_chat_id: string | null;
  evidence_notes: string;

  // Admin
  issued_by: string;
  issued_at: timestamp;

  // Acknowledgment
  acknowledged_at: timestamp | null;
  user_response: string | null;

  // Expiration
  expires_at: timestamp;           // warnings expire after 90 days
  is_active: boolean;
}
```

**Warning Escalation:**

| Warning Count (90 days) | Consequence |
|-------------------------|-------------|
| 1 | Warning only |
| 2 | 24-hour selling restriction |
| 3 | 7-day account restriction |
| 4 | 30-day suspension |
| 5+ | Review for permanent ban |

---

## 3. Item & Content Moderation

### 3.1 Item Submission Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ITEM SUBMISSION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Seller       ┌──────────┐         ┌──────────┐         ┌──────────┐       │
│  Action  ────▶│  DRAFT   │────────▶│ PENDING  │────────▶│  ACTIVE  │       │
│               └──────────┘         └────┬─────┘         └────┬─────┘       │
│                    │                    │                    │             │
│               (save draft)         (submit)            (approved)          │
│                                        │                    │              │
│                                        ▼                    │              │
│                               ┌───────────────┐             │              │
│                               │ AUTO-MODERATE │             │              │
│                               │ • Keywords    │             │              │
│                               │ • Images      │             │              │
│                               │ • Risk score  │             │              │
│                               └───────┬───────┘             │              │
│                                       │                     │              │
│                    ┌──────────────────┼──────────────────┐  │              │
│                    │                  │                  │  │              │
│                    ▼                  ▼                  ▼  │              │
│               ┌─────────┐       ┌──────────┐       ┌────────┴─┐            │
│               │ REJECT  │       │  QUEUE   │       │AUTO-PASS │            │
│               │(score>80)│       │(30-80)   │       │(score<30)│            │
│               └────┬────┘       └────┬─────┘       └──────────┘            │
│                    │                 │                                     │
│                    │                 ▼                                     │
│                    │          ┌──────────┐                                 │
│                    │          │  MANUAL  │                                 │
│                    │          │  REVIEW  │                                 │
│                    │          └────┬─────┘                                 │
│                    │               │                                       │
│                    │    ┌──────────┼──────────┐                            │
│                    │    │          │          │                            │
│                    ▼    ▼          ▼          ▼                            │
│               ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│               │ REJECTED │   │  ACTIVE  │   │ FLAGGED  │                   │
│               │          │   │          │   │(needs fix)│                   │
│               └──────────┘   └────┬─────┘   └──────────┘                   │
│                                   │                                        │
│                                   │ (report received)                      │
│                                   ▼                                        │
│                             ┌──────────┐                                   │
│                             │  HIDDEN  │────▶ Review ────▶ Restore/Delete │
│                             └──────────┘                                   │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Item Status Definitions

| Status | Visible to Public | Editable by Seller | Description |
|--------|-------------------|-------------------|-------------|
| DRAFT | No | Yes | Incomplete listing, not submitted |
| PENDING | No | No | Awaiting moderation |
| ACTIVE | Yes | Yes (limited) | Live on marketplace |
| SOLD | Yes (marked) | No | Transaction completed |
| RESERVED | Yes (marked) | No | Transaction in progress |
| HIDDEN | No | No | Hidden by admin/system |
| DELETED | No | No | Soft deleted, recoverable 30 days |

### 3.3 System Actions

| Action | Trigger | Effect | Reversible | Notification |
|--------|---------|--------|------------|--------------|
| **Auto-Approve** | Risk score < 30 | Set ACTIVE | N/A | None |
| **Queue** | Risk score 30-80 | Set PENDING, add to queue | N/A | None |
| **Auto-Reject** | Risk score > 80 | Set REJECTED | Admin appeal | Email seller |
| **Hide** | Report/Admin action | Set HIDDEN | Yes | Email seller |
| **Delete** | Policy violation | Set DELETED | 30 days | Email seller |
| **Edit Category** | Wrong category detected | Update category | N/A | In-app |
| **Price Flag** | Suspicious pricing | Add warning label | Auto-remove | None |

### 3.4 Prohibited & Restricted Items Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PROHIBITED ITEMS (NEVER ALLOWED)                        │
├────────────────────────────┬────────────────────────────────────────────────┤
│ Category                   │ Examples                                       │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Weapons & Ammunition       │ Guns, knives (>15cm), ammunition, explosives,  │
│                            │ tasers, pepper spray, brass knuckles           │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Drugs & Drug Paraphernalia │ Illegal drugs, prescription meds (no Rx),      │
│                            │ bongs, pipes, drug testing circumvention       │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Adult Content              │ Pornography, sex toys, escort services         │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Counterfeit Goods          │ Fake luxury items, replica electronics,        │
│                            │ pirated software/media                         │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Stolen Property            │ Any item known or suspected to be stolen       │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Hazardous Materials        │ Chemicals, radioactive materials, asbestos     │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Living Creatures           │ Pets, wildlife, endangered species             │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Human Remains/Body Parts   │ Bones, organs, bodily fluids                   │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Government/Military Items  │ Uniforms, IDs, classified documents            │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Financial Instruments      │ Currency, gift cards (bulk), crypto devices    │
└────────────────────────────┴────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                  RESTRICTED ITEMS (REQUIRE VERIFICATION)                    │
├────────────────────────────┬────────────────────────────────────────────────┤
│ Category                   │ Requirements                                   │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Electronics (>₩500K)       │ Proof of purchase or ownership                 │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Vehicles & Parts           │ Registration documents                         │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Luxury Items (>₩1M)        │ Authenticity verification                      │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Medical Devices            │ FDA/KFDA clearance documentation               │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Recalled Products          │ Not allowed (auto-blocked by model/serial)     │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Age-Restricted             │ Alcohol, tobacco accessories - verified 21+    │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Tickets & Vouchers         │ Verified seller only, no markup >20%          │
└────────────────────────────┴────────────────────────────────────────────────┘
```

### 3.5 Auto-Flagging Rules (V2+)

```typescript
interface AutoFlagRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;

  // Conditions
  conditions: {
    field: 'title' | 'description' | 'category' | 'price' | 'images' | 'seller';
    operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'matches_regex' | 'in_list';
    value: string | number | string[];
  }[];
  condition_logic: 'AND' | 'OR';

  // Action
  action: 'FLAG' | 'HIDE' | 'REJECT' | 'REQUIRE_REVIEW';
  risk_score_impact: number;
  notification_type: 'NONE' | 'ADMIN_ONLY' | 'SELLER' | 'BOTH';

  // Metadata
  created_at: timestamp;
  created_by: string;
  hit_count: number;
  false_positive_count: number;
}

// Example rules
const autoFlagRules: AutoFlagRule[] = [
  {
    id: 'rule_001',
    name: 'Counterfeit Keywords',
    description: 'Flag items with counterfeit indicators',
    enabled: true,
    priority: 1,
    conditions: [
      { field: 'title', operator: 'matches_regex', value: '(replica|1:1|AAA|fake|imitation)' },
      { field: 'category', operator: 'in_list', value: ['luxury', 'designer', 'watches'] }
    ],
    condition_logic: 'AND',
    action: 'FLAG',
    risk_score_impact: 40,
    notification_type: 'ADMIN_ONLY',
    created_at: '2024-01-01',
    created_by: 'system',
    hit_count: 234,
    false_positive_count: 12
  },
  {
    id: 'rule_002',
    name: 'Suspiciously Low Price',
    description: 'Flag items priced >70% below category average',
    enabled: true,
    priority: 2,
    conditions: [
      { field: 'price', operator: 'less_than', value: 'category_avg * 0.3' }
    ],
    condition_logic: 'AND',
    action: 'REQUIRE_REVIEW',
    risk_score_impact: 30,
    notification_type: 'ADMIN_ONLY',
    created_at: '2024-01-01',
    created_by: 'system',
    hit_count: 89,
    false_positive_count: 45
  }
];
```

### 3.6 Image Moderation Rules

| Check Type | Method | Threshold | Action |
|------------|--------|-----------|--------|
| NSFW Detection | ML Model | >0.8 confidence | Auto-reject |
| Watermark/Logo | ML Model | >0.9 confidence | Flag for review |
| Stock Photo | Reverse image search | Exact match | Flag + warn |
| Duplicate | Perceptual hash | >0.95 similarity | Merge/flag |
| Low Quality | Resolution check | <400x400px | Warn seller |
| Text in Image | OCR | Contains blocked words | Apply text rules |
| Face Detection | ML Model | Unobscured faces | Blur suggestion |

---

## 4. Dispute & Report Handling

### 4.1 Report Categories

```typescript
type ReportCategory =
  | 'FRAUD'              // Scam, didn't receive item, payment fraud
  | 'COUNTERFEIT'        // Fake/replica items
  | 'PROHIBITED'         // Items not allowed on platform
  | 'HARASSMENT'         // Threatening, abusive behavior
  | 'SPAM'               // Duplicate listings, irrelevant content
  | 'MISREPRESENTATION'  // Item not as described
  | 'NO_SHOW'            // Seller/buyer didn't show up for meetup
  | 'PRICE_GOUGING'      // Unreasonable price changes
  | 'SAFETY_CONCERN'     // Potential danger to users
  | 'COPYRIGHT'          // Intellectual property violation
  | 'OTHER';             // Catch-all

interface ReportSubcategory {
  category: ReportCategory;
  subcategories: string[];
}

const reportSubcategories: ReportSubcategory[] = [
  {
    category: 'FRAUD',
    subcategories: [
      'Never received item',
      'Item significantly different',
      'Payment taken, no response',
      'Fake payment proof',
      'Identity theft'
    ]
  },
  {
    category: 'COUNTERFEIT',
    subcategories: [
      'Fake luxury brand',
      'Knockoff electronics',
      'Pirated media/software',
      'Forged documents'
    ]
  },
  {
    category: 'HARASSMENT',
    subcategories: [
      'Threatening messages',
      'Hate speech',
      'Sexual harassment',
      'Stalking behavior',
      'Doxxing'
    ]
  }
];
```

### 4.2 Dispute Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DISPUTE RESOLUTION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ STAGE 1: INITIATION (Day 0)                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Buyer/Seller opens dispute through transaction page                   │ │
│ │ • Select dispute reason from predefined list                            │ │
│ │ • Provide description and evidence (photos, screenshots)                │ │
│ │ • System notifies other party                                           │ │
│ │ • Transaction status → DISPUTED                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│ STAGE 2: PEER RESOLUTION (Days 1-3)                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Both parties can communicate through dispute thread                   │ │
│ │ • Each party submits their version + evidence                           │ │
│ │ • Suggested resolutions:                                                │ │
│ │   - Full refund                                                         │ │
│ │   - Partial refund (% negotiable)                                       │ │
│ │   - Item return + refund                                                │ │
│ │   - No refund (buyer keeps item)                                        │ │
│ │ • If agreement reached → Close dispute                                  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                              (no agreement)                                 │
│                                    ▼                                        │
│ STAGE 3: ADMIN MEDIATION (Days 4-7)                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Dispute escalated to admin queue                                      │ │
│ │ • Admin reviews all evidence:                                           │ │
│ │   - Original listing (cached version)                                   │ │
│ │   - Chat history                                                        │ │
│ │   - Transaction details                                                 │ │
│ │   - Photos/evidence from both parties                                   │ │
│ │   - User history (previous disputes, warnings)                          │ │
│ │ • Admin may request additional information                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│ STAGE 4: DECISION (Day 7-10)                                                │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Admin makes final decision:                                             │ │
│ │                                                                         │ │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│ │ │ BUYER WINS  │  │ SELLER WINS │  │   SPLIT     │  │  DISMISSED  │     │ │
│ │ │             │  │             │  │             │  │             │     │ │
│ │ │ Full/partial│  │ No refund   │  │ Partial to  │  │ Insufficient│     │ │
│ │ │ refund      │  │ issued      │  │ both parties│  │ evidence    │     │ │
│ │ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│ │                                                                         │ │
│ │ Additional actions may include:                                         │ │
│ │ • Warning issued to losing party                                        │ │
│ │ • Account restriction/suspension                                        │ │
│ │ • Item removed from platform                                            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│ STAGE 5: APPEAL (Days 10-17, optional)                                      │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Losing party may appeal within 7 days                                 │ │
│ │ • Must provide NEW evidence not previously submitted                    │ │
│ │ • Senior admin reviews appeal                                           │ │
│ │ • Decision is final                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Dispute Data Structure

```typescript
interface Dispute {
  id: string;
  transaction_id: string;

  // Parties
  initiator_id: string;
  initiator_role: 'BUYER' | 'SELLER';
  respondent_id: string;

  // Details
  reason: DisputeReason;
  description: string;
  desired_outcome: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'RETURN_ITEM' | 'OTHER';
  desired_amount: number | null;

  // Evidence
  evidence: DisputeEvidence[];

  // Status
  status: 'OPEN' | 'PEER_RESOLUTION' | 'ADMIN_REVIEW' | 'DECIDED' | 'APPEALED' | 'CLOSED';
  stage: 1 | 2 | 3 | 4 | 5;

  // Resolution
  decision: 'BUYER_WINS' | 'SELLER_WINS' | 'SPLIT' | 'DISMISSED' | null;
  decision_reason: string | null;
  refund_amount: number | null;
  decided_by: string | null;
  decided_at: timestamp | null;

  // Appeal
  appeal_filed: boolean;
  appeal_reason: string | null;
  appeal_evidence: DisputeEvidence[];
  appeal_decision: 'UPHELD' | 'OVERTURNED' | null;
  appeal_decided_by: string | null;
  appeal_decided_at: timestamp | null;

  // Actions taken
  actions_taken: DisputeAction[];

  // Timestamps
  created_at: timestamp;
  updated_at: timestamp;
  peer_resolution_deadline: timestamp;
  admin_decision_deadline: timestamp;
}

interface DisputeEvidence {
  id: string;
  dispute_id: string;
  submitted_by: string;
  type: 'IMAGE' | 'SCREENSHOT' | 'DOCUMENT' | 'CHAT_LOG' | 'VIDEO';
  url: string;
  description: string;
  submitted_at: timestamp;
}

interface DisputeAction {
  action: 'WARNING_ISSUED' | 'ACCOUNT_RESTRICTED' | 'ACCOUNT_SUSPENDED' |
          'ITEM_REMOVED' | 'REFUND_PROCESSED' | 'RATING_ADJUSTED';
  target_user_id: string;
  details: string;
  executed_at: timestamp;
}
```

### 4.4 Cumulative Penalty Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CUMULATIVE PENALTY MATRIX                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ REPORT-BASED ESCALATION (rolling 30-day window)                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Valid Reports │ Action                                                  │ │
│ ├───────────────┼─────────────────────────────────────────────────────────┤ │
│ │      1        │ No action (unless severe)                               │ │
│ │      2        │ Formal warning                                          │ │
│ │      3        │ 7-day selling restriction                               │ │
│ │      4        │ 14-day full restriction                                 │ │
│ │      5+       │ Account suspension + review for ban                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ DISPUTE-BASED ESCALATION (rolling 90-day window)                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Lost Disputes │ Action                                                  │ │
│ ├───────────────┼─────────────────────────────────────────────────────────┤ │
│ │      1        │ Warning + educational content                           │ │
│ │      2        │ Mandatory verification required                         │ │
│ │      3        │ 30-day restriction + deposit hold                       │ │
│ │      4+       │ Permanent ban consideration                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ SEVERITY MULTIPLIERS                                                        │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Violation Type        │ Multiplier │ Immediate Action                   │ │
│ ├───────────────────────┼────────────┼────────────────────────────────────┤ │
│ │ Fraud (confirmed)     │    3x      │ Immediate suspension               │ │
│ │ Harassment            │    2x      │ Messaging restriction              │ │
│ │ Counterfeit           │    2x      │ Item removal + warning             │ │
│ │ No-show (3rd time)    │    1.5x    │ Platform fee forfeiture            │ │
│ │ Spam                  │    1x      │ Listing limits                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Evidence Reference System

```typescript
// Evidence types that can be attached to disputes
interface EvidenceReference {
  type: 'CHAT' | 'ITEM' | 'TRANSACTION' | 'PROFILE' | 'EXTERNAL';
  reference_id: string;
  snapshot_url: string | null;  // Cached version at time of dispute
  metadata: Record<string, unknown>;
}

// Chat evidence includes
interface ChatEvidence extends EvidenceReference {
  type: 'CHAT';
  metadata: {
    chat_room_id: string;
    message_ids: string[];        // Specific messages
    date_range: { start: timestamp; end: timestamp };
    flagged_messages: string[];   // Auto-detected issues
  };
}

// Item evidence includes
interface ItemEvidence extends EvidenceReference {
  type: 'ITEM';
  metadata: {
    item_id: string;
    version_at_dispute: number;  // Track if edited after sale
    original_images: string[];
    original_description: string;
    original_price: number;
  };
}
```

---

## 5. Analytics Dashboard & KPIs

### 5.1 Key Metrics Definitions

| Metric | Formula | Why It Matters | Frequency |
|--------|---------|----------------|-----------|
| **GMV** | Sum(final_price) for COMPLETED transactions | Revenue potential, market size | Daily |
| **Take Rate** | Sum(platform_fee) / GMV × 100 | Monetization efficiency | Weekly |
| **Listings Created** | Count(items WHERE created_at in period) | Supply growth | Daily |
| **Active Listings** | Count(items WHERE status='ACTIVE') | Available inventory | Daily |
| **Conversion Rate** | Transactions / Unique Item Views × 100 | Listing quality, demand match | Daily |
| **Sell-Through Rate** | Items Sold / Items Listed (period) × 100 | Inventory turnover | Weekly |
| **Avg Days to Sell** | Avg(sold_at - created_at) | Market liquidity | Weekly |
| **DAU/MAU** | Daily Active Users / Monthly Active Users | User engagement, stickiness | Daily |
| **Buyer/Seller Ratio** | Unique Buyers / Unique Sellers | Market balance | Weekly |
| **Repeat Purchase Rate** | Users with 2+ purchases / Total Buyers × 100 | Buyer retention | Monthly |
| **Repeat Seller Rate** | Users with 2+ listings / Total Sellers × 100 | Seller retention | Monthly |
| **Avg Transaction Value** | GMV / Transaction Count | Pricing trends | Daily |
| **Time to First Sale** | Avg(first_sale_at - account_created_at) | Seller onboarding | Weekly |
| **Report Rate** | Reports / Transactions × 100 | Platform trust, quality | Weekly |
| **Dispute Rate** | Disputes / Transactions × 100 | Transaction problems | Weekly |
| **Resolution Time** | Avg(resolved_at - created_at) for reports | Ops efficiency | Daily |
| **Moderation Queue Size** | Count(items WHERE status='PENDING') | Ops capacity | Hourly |
| **Auto-Approve Rate** | Auto-approved / Total Submitted × 100 | Automation efficiency | Daily |
| **False Positive Rate** | Appeals Won / Auto-rejected × 100 | Automation accuracy | Weekly |

### 5.2 Dashboard Widget Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Marketplace Analytics                    [Today] [7d] [30d] [90d] [Custom] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ KEY METRICS (Top Row - Always Visible)                                      │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│ │    GMV    │ │Transactions│ │  Active   │ │   DAU     │ │ Dispute   │     │
│ │  ₩45.2M   │ │    234     │ │ Listings  │ │   892     │ │   Rate    │     │
│ │  ↑15%     │ │   ↑8%      │ │  1,245    │ │   ↑3%     │ │   1.2%    │     │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
│                                                                             │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────────────┐ │
│ │ GMV TREND (30 days)             │ │ TRANSACTION FUNNEL                  │ │
│ │                                 │ │                                     │ │
│ │  ₩2M ┤         ╭──────────╮    │ │ Listed        ████████████████ 1,245│ │
│ │      │    ╭────╯          │    │ │ Viewed        ██████████████ 1,050  │ │
│ │  ₩1M ┤───╯               │    │ │ Inquired      ████████ 623          │ │
│ │      │                    │    │ │ Agreed        ██████ 412            │ │
│ │    0 └────────────────────     │ │ Completed     █████ 342             │ │
│ │       1    10    20    30      │ │ Conv Rate: 27.5%                    │ │
│ └─────────────────────────────────┘ └─────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────────────┐ │
│ │ CATEGORY BREAKDOWN              │ │ OPERATIONS HEALTH                   │ │
│ │                                 │ │                                     │ │
│ │ Electronics  ████████████ 34%  │ │ Pending Reviews:   23  (⚠️ 5 urgent)│ │
│ │ Clothing     ██████████ 26%    │ │ Open Reports:      12  (🔴 2 SLA)   │ │
│ │ Home & Garden████████ 20%      │ │ Active Disputes:    3               │ │
│ │ Sports       ██████ 12%        │ │ Avg Resolution:   4.2h              │ │
│ │ Other        ████ 8%           │ │ Auto-Approve Rate: 67%              │ │
│ └─────────────────────────────────┘ └─────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────────────┐ │
│ │ USER ACQUISITION                │ │ TRUST & SAFETY                      │ │
│ │                                 │ │                                     │ │
│ │ New Users (7d):        +156     │ │ Report Rate:         1.2%          │ │
│ │ New Sellers (7d):       +42     │ │ Fraud Rate:          0.3%          │ │
│ │ Verified Sellers:       234     │ │ Scam Attempts (7d):    8           │ │
│ │ Churn Rate (30d):      4.5%     │ │ Users Banned (7d):     3           │ │
│ │                                 │ │ Avg Seller Rating:   4.6⭐         │ │
│ └─────────────────────────────────┘ └─────────────────────────────────────┘ │
│                                                                             │
│ ┌───────────────────────────────────────────────────────────────────────────┐│
│ │ LOCATION HEATMAP                                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐  ││
│ │ │                                                                     │  ││
│ │ │     Camp Humphreys: 756 listings    Osan AB: 489 listings          │  ││
│ │ │     ████████████████████████       ███████████████                 │  ││
│ │ │                                                                     │  ││
│ │ └─────────────────────────────────────────────────────────────────────┘  ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Ops Report Templates

#### Daily Ops Report

```markdown
# Daily Operations Report - [DATE]

## Executive Summary
- GMV: ₩X.XM (↑/↓ X% vs yesterday)
- Transactions: XXX (↑/↓ X%)
- New listings: XX
- Active users: XXX

## Alerts & Issues
- 🔴 [X] SLA breaches
- 🟡 [X] Pending urgent reviews
- ⚠️ [X] Flagged high-risk items

## Actions Taken
- [X] items moderated
- [X] reports resolved
- [X] users warned/restricted

## Top Performing
- Category: [Category] (XX% of GMV)
- Item: [Title] (₩XXX,XXX)
- Seller: [Username] (X transactions)

## Tomorrow's Focus
- [List of priority items]
```

#### Weekly Ops Report

```markdown
# Weekly Operations Report - Week of [DATE]

## Key Metrics (vs Previous Week)
| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| GMV | ₩XXM | ₩XXM | +X% |
| Transactions | XXX | XXX | +X% |
| New Users | XXX | XXX | +X% |
| Active Listings | X,XXX | X,XXX | +X% |
| Dispute Rate | X.X% | X.X% | -X% |

## Category Performance
[Category breakdown table]

## User Growth
- New registrations: XXX
- New sellers: XX
- Verified sellers: XX
- Churned users: XX

## Trust & Safety
- Reports received: XX
- Reports resolved: XX
- Avg resolution time: X.Xh
- Users penalized: XX

## Notable Events
- [List of significant events, issues, or achievements]

## Recommendations
- [Action items for next week]
```

### 5.4 Alert Thresholds

```typescript
interface AlertThreshold {
  metric: string;
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  notification: ('EMAIL' | 'SLACK' | 'IN_APP')[];
  recipients: string[];  // admin user IDs or 'all'
}

const alertThresholds: AlertThreshold[] = [
  // Operations alerts
  { metric: 'pending_reviews', condition: 'above', threshold: 50, severity: 'WARNING', notification: ['IN_APP', 'SLACK'], recipients: ['all'] },
  { metric: 'pending_reviews', condition: 'above', threshold: 100, severity: 'CRITICAL', notification: ['EMAIL', 'SLACK', 'IN_APP'], recipients: ['all'] },
  { metric: 'sla_breaches', condition: 'above', threshold: 0, severity: 'CRITICAL', notification: ['SLACK', 'IN_APP'], recipients: ['all'] },
  { metric: 'avg_resolution_time', condition: 'above', threshold: 24, severity: 'WARNING', notification: ['IN_APP'], recipients: ['all'] },

  // Business alerts
  { metric: 'daily_gmv', condition: 'change_percent', threshold: -30, severity: 'WARNING', notification: ['EMAIL', 'SLACK'], recipients: ['super_admin'] },
  { metric: 'daily_transactions', condition: 'change_percent', threshold: -40, severity: 'CRITICAL', notification: ['EMAIL', 'SLACK'], recipients: ['super_admin'] },
  { metric: 'new_listings', condition: 'below', threshold: 10, severity: 'INFO', notification: ['IN_APP'], recipients: ['all'] },

  // Trust & Safety alerts
  { metric: 'dispute_rate', condition: 'above', threshold: 5, severity: 'CRITICAL', notification: ['EMAIL', 'SLACK'], recipients: ['super_admin'] },
  { metric: 'fraud_rate', condition: 'above', threshold: 2, severity: 'CRITICAL', notification: ['EMAIL', 'SLACK'], recipients: ['all'] },
  { metric: 'report_rate', condition: 'above', threshold: 10, severity: 'WARNING', notification: ['SLACK'], recipients: ['all'] },
];
```

---

## 6. Policy & Safety Layer

### 6.1 Prohibited Items Policy

```markdown
# Prohibited Items Policy

## Absolutely Prohibited (Immediate Removal + Account Action)

### 1. Weapons & Dangerous Items
- Firearms (including replicas that look realistic)
- Ammunition and explosives
- Knives with blades over 15cm
- Tasers, stun guns, pepper spray
- Brass knuckles, batons, martial arts weapons

### 2. Controlled Substances
- Illegal drugs of any kind
- Prescription medications (without valid prescription)
- Drug paraphernalia (pipes, bongs, syringes)
- Products to circumvent drug tests

### 3. Counterfeit & Stolen Goods
- Fake designer items (bags, watches, clothing)
- Replica electronics with brand logos
- Pirated software, movies, music
- Items suspected to be stolen

### 4. Adult & Explicit Content
- Pornographic materials
- Sex toys and adult novelty items
- Escort or sexual services

### 5. Living Things & Human Products
- Live animals or pets
- Endangered species products (ivory, fur)
- Human remains or body parts
- Bodily fluids

### 6. Hazardous Materials
- Chemicals and toxic substances
- Radioactive materials
- Recalled products (checked against database)

### 7. Government & Military
- Military uniforms (active duty)
- Government IDs or badges
- Classified documents

### 8. Financial & Legal
- Currency (foreign or domestic)
- Gift cards in bulk (>5 cards)
- Lottery tickets
- Fake documents or diplomas

## Restricted Items (Require Verification)

### High-Value Electronics (>₩500,000)
- Must provide proof of purchase or ownership
- Serial numbers verified against stolen database

### Luxury Goods (>₩1,000,000)
- Authenticity verification required
- Photos of authentication cards/receipts

### Vehicles & Parts
- Registration documents required
- VIN verification for vehicles

### Alcohol & Tobacco Accessories
- Seller must be verified 21+
- No direct sales of alcohol/tobacco products

### Tickets & Event Passes
- Maximum 20% markup allowed
- Verified seller status required
```

### 6.2 Marketplace Terms of Service (Outline)

```markdown
# Off-Base Marketplace Terms of Service

## Table of Contents

1. ACCEPTANCE OF TERMS
   1.1 Agreement to Terms
   1.2 Eligibility Requirements
   1.3 Account Registration

2. MARKETPLACE SERVICES
   2.1 Platform Description
   2.2 Buyer and Seller Roles
   2.3 Transaction Process
   2.4 Communication Tools

3. USER ACCOUNTS
   3.1 Account Creation
   3.2 Account Security
   3.3 Verification Requirements
   3.4 Account Suspension/Termination

4. LISTING POLICIES
   4.1 Prohibited Items
   4.2 Restricted Items
   4.3 Listing Requirements
   4.4 Pricing Rules
   4.5 Image and Description Standards

5. TRANSACTIONS
   5.1 Agreement Between Parties
   5.2 Payment Methods
   5.3 Delivery/Meetup Requirements
   5.4 Cancellation Policy
   5.5 Refund Policy

6. FEES AND PAYMENTS
   6.1 Platform Fees (if applicable)
   6.2 Payment Processing
   6.3 Fee Changes

7. USER CONDUCT
   7.1 Prohibited Behavior
   7.2 Communication Standards
   7.3 Harassment Policy
   7.4 Fraud Prevention

8. CONTENT AND INTELLECTUAL PROPERTY
   8.1 User-Generated Content
   8.2 License Grant
   8.3 Copyright Compliance
   8.4 Trademark Policy

9. DISPUTE RESOLUTION
   9.1 Peer Resolution Period
   9.2 Platform Mediation
   9.3 Decision Process
   9.4 Appeals

10. TRUST AND SAFETY
    10.1 Verification Programs
    10.2 Rating System
    10.3 Report Mechanism
    10.4 Enforcement Actions

11. PRIVACY AND DATA
    11.1 Data Collection
    11.2 Data Usage
    11.3 Data Sharing
    11.4 User Rights

12. DISCLAIMERS AND LIMITATIONS
    12.1 Service Availability
    12.2 Content Accuracy
    12.3 Third-Party Links
    12.4 Limitation of Liability

13. INDEMNIFICATION

14. MODIFICATIONS TO TERMS

15. GOVERNING LAW AND JURISDICTION

16. CONTACT INFORMATION
```

### 6.3 Safe Trading Guidelines (User-Facing)

```markdown
# Safe Trading Guide

## 🛡️ Protect Yourself When Buying

### Before You Buy
- [ ] Check seller's rating and reviews
- [ ] Look for verified seller badge
- [ ] Read the full item description
- [ ] Review all photos carefully
- [ ] Ask questions through our chat system
- [ ] Be suspicious of prices that seem too good to be true

### During the Transaction
- [ ] ALWAYS meet in a public, well-lit location
- [ ] Bring a friend if possible
- [ ] Inspect the item thoroughly before paying
- [ ] Test electronics before completing purchase
- [ ] Don't feel pressured to rush

### Payment Safety
- ✅ Use in-app payment when available
- ✅ Meet in person for cash transactions
- ❌ NEVER send money before receiving item
- ❌ NEVER use wire transfers, gift cards, or crypto
- ❌ NEVER share banking details in chat

### Red Flags to Watch For
- 🚩 Seller asks for payment before meeting
- 🚩 Price is significantly below market value
- 🚩 Seller refuses to meet in person
- 🚩 Pressure to complete transaction quickly
- 🚩 Requests to communicate outside the app
- 🚩 Stock photos instead of actual item photos

---

## 🏷️ Protect Yourself When Selling

### Creating Your Listing
- [ ] Take clear, well-lit photos of the actual item
- [ ] Write honest, detailed descriptions
- [ ] Disclose any defects or damage
- [ ] Set a fair, reasonable price
- [ ] Respond to questions promptly

### During the Transaction
- [ ] Meet buyers in public locations
- [ ] Verify payment before handing over item
- [ ] Get cash in hand before releasing expensive items
- [ ] Consider bringing a friend for high-value items

### Avoiding Scams
- ❌ NEVER ship before receiving payment
- ❌ NEVER accept checks or money orders
- ❌ NEVER fall for "overpayment" scams
- ❌ NEVER share personal financial information

---

## 📍 Recommended Meetup Locations

### Camp Humphreys Area
- Main PX Parking Lot
- Commissary Entrance
- MWR Facilities
- Food Court Areas

### Osan Air Base Area
- BX Parking Lot
- Community Center
- Fitness Center Lobby

### General Tips
- Meet during daylight hours
- Choose locations with security cameras
- Stay in well-trafficked areas
- Let someone know where you're going

---

## 🆘 What to Do If Something Goes Wrong

1. **Document Everything**
   - Save all chat messages
   - Take photos of the item received
   - Keep payment receipts

2. **Report Through the App**
   - Use the "Report" button on the transaction
   - Provide detailed description
   - Attach all evidence

3. **Contact Support**
   - Our team reviews all reports within 24 hours
   - We can mediate disputes between parties

4. **If You Suspect Criminal Activity**
   - Contact local authorities
   - Report to Military Police if on base
   - Provide them with all documentation
```

### 6.4 Moderation & Enforcement Policy

```markdown
# Moderation & Enforcement Policy

## Principles

1. **Proportionality**: Penalties match the severity of violations
2. **Consistency**: Similar violations receive similar treatment
3. **Transparency**: Users understand why actions were taken
4. **Due Process**: Users can appeal decisions
5. **Education First**: Minor first-time violations receive warnings

## Violation Categories

### Category A: Severe (Immediate Action)
- Confirmed fraud or scam
- Sale of prohibited items (weapons, drugs)
- Harassment or threats
- Identity theft
- Repeated serious violations

**Action**: Immediate suspension pending review, possible permanent ban

### Category B: Serious
- Counterfeit item sales
- Significant misrepresentation
- Multiple valid reports
- Policy circumvention
- Doxxing or privacy violations

**Action**: Account restriction (7-30 days), required verification

### Category C: Moderate
- Minor misrepresentation
- Spam listings
- Off-platform transaction attempts
- Inappropriate content
- No-show behavior

**Action**: Warning, temporary listing restriction (1-7 days)

### Category D: Minor
- Incorrect category
- Missing required information
- Duplicate listings
- Pricing issues

**Action**: Content edited/removed, educational notification

## Enforcement Process

### 1. Detection
- User report
- Automated flagging
- Admin discovery

### 2. Review
- Gather evidence
- Check user history
- Verify violation

### 3. Decision
- Apply appropriate action
- Document reasoning
- Notify user

### 4. Appeal (if applicable)
- User submits appeal with evidence
- Senior admin review
- Final decision communicated

## User Rights

- Receive notification of enforcement action
- Understand reason for action
- Appeal within 7 days (14 days for bans)
- Request data associated with decision
- One appeal per violation

## Admin Guidelines

- Never take action based solely on report count
- Always review evidence before action
- Document all decisions with reasoning
- Consult senior admin for Category A/B violations
- Maintain objectivity regardless of user status
```

---

## 7. Automation / ML / Ops Enhancements

### 7.1 Automation Opportunity Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATION EVOLUTION ROADMAP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AREA               │ MVP (Manual)   │ V2 (Rules)      │ V3 (ML)           │
│  ──────────────────┼────────────────┼─────────────────┼───────────────────│
│                     │                │                 │                   │
│  MODERATION         │ Human review   │ Keyword filter  │ NLP + Image AI   │
│  ────────────────── │ all listings   │ + risk scoring  │ auto-decision    │
│                     │                │                 │                   │
│  FRAUD DETECTION    │ Report-based   │ Rule engine     │ ML anomaly       │
│  ────────────────── │ investigation  │ (velocity,      │ detection +      │
│                     │                │ patterns)       │ network analysis │
│                     │                │                 │                   │
│  USER TRUST         │ Manual verify  │ Tiered verify   │ Continuous       │
│  ────────────────── │ on request     │ + auto-badge    │ trust scoring    │
│                     │                │                 │                   │
│  RECOMMENDATIONS    │ Recent/Popular │ Category +      │ Collaborative    │
│  ────────────────── │ sorting        │ location rules  │ filtering + NLP  │
│                     │                │                 │                   │
│  CS TRIAGE          │ Manual queue   │ Keyword route   │ Intent classify  │
│  ────────────────── │ assignment     │ + priority      │ + auto-response  │
│                     │                │                 │                   │
│  PRICING            │ None           │ Category avg    │ Dynamic pricing  │
│  ────────────────── │                │ comparison      │ suggestions      │
│                     │                │                 │                   │
│  SEARCH RANKING     │ Recency        │ Relevance +     │ Personalized     │
│  ────────────────── │                │ quality score   │ learning-to-rank │
│                     │                │                 │                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Detailed Automation Specifications

#### 7.2.1 Content Moderation Pipeline

```typescript
// V2: Rules-based moderation
interface ModerationPipeline {
  stages: [
    {
      name: 'text_analysis';
      checks: [
        { type: 'keyword_match'; config: ProhibitedKeywords },
        { type: 'pattern_match'; config: SuspiciousPatterns },
        { type: 'length_check'; min: 10; max: 5000 },
        { type: 'language_detect'; allowed: ['en', 'ko'] }
      ];
    },
    {
      name: 'image_analysis';
      checks: [
        { type: 'nsfw_detection'; provider: 'aws_rekognition'; threshold: 0.8 },
        { type: 'duplicate_check'; provider: 'perceptual_hash'; threshold: 0.95 },
        { type: 'quality_check'; min_resolution: 400; min_count: 1 }
      ];
    },
    {
      name: 'risk_scoring';
      factors: [
        { factor: 'text_risk'; weight: 0.3 },
        { factor: 'image_risk'; weight: 0.3 },
        { factor: 'seller_history'; weight: 0.2 },
        { factor: 'price_anomaly'; weight: 0.1 },
        { factor: 'category_risk'; weight: 0.1 }
      ];
    }
  ];

  thresholds: {
    auto_approve: 30;
    manual_review: 70;
    auto_reject: 85;
  };
}

// V3: ML-enhanced moderation
interface MLModerationPipeline extends ModerationPipeline {
  ml_models: [
    {
      name: 'prohibited_item_classifier';
      type: 'image_classification';
      classes: ['weapon', 'drug', 'counterfeit', 'adult', 'safe'];
      threshold: 0.7;
    },
    {
      name: 'scam_text_detector';
      type: 'text_classification';
      model: 'fine_tuned_bert';
      classes: ['scam', 'suspicious', 'normal'];
      threshold: 0.8;
    },
    {
      name: 'price_anomaly_detector';
      type: 'regression';
      input: ['category', 'condition', 'brand', 'description_embedding'];
      output: 'expected_price_range';
    }
  ];
}
```

#### 7.2.2 Fraud Detection System

```typescript
// Risk scoring factors
interface FraudRiskFactors {
  // Account signals
  account_age_days: number;              // Newer = higher risk
  verification_level: number;            // Lower = higher risk
  previous_violations: number;           // More = higher risk

  // Behavioral signals
  listing_velocity: number;              // Items/day, high = risky
  price_consistency: number;             // Deviation from category avg
  response_rate: number;                 // Low = suspicious
  cancellation_rate: number;             // High = risky
  dispute_rate: number;                  // High = very risky

  // Content signals
  stock_image_ratio: number;             // High = suspicious
  description_quality: number;           // Low/generic = suspicious
  contact_info_in_listing: boolean;      // True = suspicious

  // Network signals
  shared_device_risk: number;            // Connected to banned users
  ip_velocity: number;                   // Multiple accounts from same IP
  payment_method_changes: number;        // Frequent changes = risky
}

// Risk score calculation
function calculateRiskScore(factors: FraudRiskFactors): number {
  const weights = {
    account_age_days: { weight: 0.1, transform: (x) => Math.max(0, 100 - x) / 100 },
    verification_level: { weight: 0.1, transform: (x) => (3 - x) / 3 },
    previous_violations: { weight: 0.15, transform: (x) => Math.min(x * 20, 100) / 100 },
    listing_velocity: { weight: 0.1, transform: (x) => Math.min(x / 5, 1) },
    cancellation_rate: { weight: 0.1, transform: (x) => x },
    dispute_rate: { weight: 0.15, transform: (x) => x * 2 },
    stock_image_ratio: { weight: 0.1, transform: (x) => x },
    shared_device_risk: { weight: 0.1, transform: (x) => x },
    ip_velocity: { weight: 0.1, transform: (x) => Math.min(x / 3, 1) }
  };

  let score = 0;
  for (const [key, config] of Object.entries(weights)) {
    score += config.weight * config.transform(factors[key] || 0);
  }

  return Math.round(score * 100);
}
```

#### 7.2.3 Recommendation Engine

```typescript
// V2: Rule-based recommendations
interface RecommendationRulesV2 {
  home_feed: {
    algorithm: 'weighted_mix';
    components: [
      { source: 'recent_listings'; weight: 0.3; limit: 20 },
      { source: 'popular_in_category'; weight: 0.25; limit: 20 },
      { source: 'location_based'; weight: 0.25; limit: 20 },
      { source: 'featured_items'; weight: 0.2; limit: 10 }
    ];
    filters: [
      { type: 'exclude_sold' },
      { type: 'exclude_hidden' },
      { type: 'seller_not_blocked' }
    ];
  };

  similar_items: {
    algorithm: 'category_price_match';
    factors: [
      { factor: 'same_category'; weight: 0.4 },
      { factor: 'similar_price'; range: 0.3; weight: 0.3 },
      { factor: 'same_location'; weight: 0.2 },
      { factor: 'same_condition'; weight: 0.1 }
    ];
    limit: 12;
  };
}

// V3: ML-based recommendations
interface RecommendationMLV3 {
  collaborative_filtering: {
    model: 'matrix_factorization';
    features: ['user_id', 'item_id', 'view', 'favorite', 'purchase'];
    embedding_dim: 64;
    update_frequency: 'daily';
  };

  content_based: {
    model: 'item_embedding';
    text_encoder: 'sentence_transformer';
    image_encoder: 'resnet50';
    similarity: 'cosine';
  };

  ranking: {
    model: 'learning_to_rank';
    features: [
      'cf_score',
      'content_score',
      'seller_rating',
      'item_freshness',
      'price_competitiveness',
      'user_location_match'
    ];
    optimization: 'ndcg@10';
  };
}
```

### 7.3 Implementation Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATION IMPLEMENTATION PHASES                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ PHASE 1: FOUNDATION (Weeks 1-4)                                             │
│ ├── Set up moderation keyword database                                      │
│ ├── Implement basic risk scoring (account age, history)                     │
│ ├── Create flagging pipeline (text patterns)                                │
│ └── Build admin queue with priority sorting                                 │
│                                                                             │
│ PHASE 2: RULES ENGINE (Weeks 5-8)                                           │
│ ├── Configurable keyword/pattern rules                                      │
│ ├── Image duplicate detection (perceptual hash)                             │
│ ├── Price anomaly detection (vs category average)                           │
│ ├── Automated SLA tracking and alerts                                       │
│ └── Basic recommendation rules (recent, popular)                            │
│                                                                             │
│ PHASE 3: EXTERNAL AI SERVICES (Weeks 9-12)                                  │
│ ├── Integrate NSFW detection API (AWS Rekognition / Google Vision)          │
│ ├── Integrate text moderation API (OpenAI / Perspective)                    │
│ ├── Implement chat monitoring with keyword triggers                         │
│ └── Add OCR for text-in-image detection                                     │
│                                                                             │
│ PHASE 4: CUSTOM ML (Weeks 13-20)                                            │
│ ├── Train prohibited item classifier on platform data                       │
│ ├── Build fraud detection model                                             │
│ ├── Implement collaborative filtering for recommendations                   │
│ ├── Create dynamic trust scoring system                                     │
│ └── Deploy CS triage classifier                                             │
│                                                                             │
│ PHASE 5: OPTIMIZATION (Ongoing)                                             │
│ ├── A/B test automation thresholds                                          │
│ ├── Monitor false positive/negative rates                                   │
│ ├── Retrain models with new data                                            │
│ └── Expand automation coverage                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Marketing & Communications

### 8.1 Feature Launch Blog Post

```markdown
# Introducing Off-Base Marketplace: Buy & Sell Within Your Community

**Your trusted platform for second-hand goods on and around U.S. military bases in Korea**

---

We're excited to announce the launch of Off-Base Marketplace — a new feature designed specifically for the military community in Korea to buy and sell pre-owned items safely and conveniently.

## Why We Built This

Moving is a way of life in the military community. PCS orders come, and suddenly you need to sell your furniture, electronics, and household items — fast. Or maybe you just arrived and need to furnish your new place without breaking the bank.

Until now, your options were limited: social media groups with no buyer/seller protections, generic apps that don't understand military life, or the BX bulletin board that... well, you know.

**Off-Base Marketplace changes that.**

## What Makes Us Different

### 🛡️ Built-in Trust & Safety
- Verified user profiles
- Seller ratings and reviews
- Secure in-app messaging
- Report and dispute resolution system

### 📍 Location-Smart
- Filter by base (Humphreys, Osan)
- See recommended meetup spots
- Connect with nearby buyers/sellers

### ⚡ Fast & Simple
- List items in under 2 minutes
- Smart category suggestions
- Easy photo upload
- In-app price negotiations

### 🤝 Community-First
- No anonymous buyers/sellers
- Reputation matters
- Designed for military lifestyle

## How It Works

1. **List Your Item** — Snap photos, add description, set price
2. **Connect** — Chat with interested buyers in-app
3. **Meet & Complete** — Arrange meetup, complete transaction
4. **Review** — Leave feedback to help the community

## Safety First

We've implemented multiple layers of protection:
- Content moderation for prohibited items
- Chat monitoring for scam patterns
- Dispute resolution support
- Educational resources for safe trading

## Get Started Today

The marketplace is now available in the Off-Base app. Update to the latest version and look for the "Marketplace" tab.

**Happy trading!** 🎉

---

*Questions or feedback? Contact us at marketplace@off-base.com*
```

### 8.2 In-App Announcement

```markdown
# 🎉 NEW: Marketplace is Here!

Buy and sell within the military community — safely and easily.

**What you can do:**
• List items you want to sell
• Browse local listings
• Chat with buyers/sellers
• Complete transactions safely

**Coming soon:**
• Seller verification badges
• Transaction history
• Advanced search filters

[Start Browsing] [List an Item]
```

### 8.3 Banner Copy (10 Variants)

| # | Headline | Subtext | CTA |
|---|----------|---------|-----|
| 1 | "PCS'ing Soon? Sell Your Stuff Fast" | List items in 2 minutes | Sell Now |
| 2 | "New to Base? Find Great Deals" | Pre-owned items from trusted sellers | Browse Deals |
| 3 | "Your Community Marketplace" | Buy & sell with verified neighbors | Explore |
| 4 | "Skip the Facebook Groups" | Trade safely on Off-Base Marketplace | Get Started |
| 5 | "Declutter Before You Move" | Turn unused items into cash | List for Free |
| 6 | "Furnish Your New Place for Less" | Quality items at community prices | Shop Now |
| 7 | "Trusted Trading, Military Style" | Verified users. Safe transactions. | Learn More |
| 8 | "Got Stuff to Sell? We Got Buyers" | Reach thousands in your community | List Now |
| 9 | "Find It. Buy It. Meet Up." | Local deals, zero shipping | Browse |
| 10 | "The PCS Marketplace" | From families who've been there | Join Now |

### 8.4 Push Notification Templates

```typescript
const pushNotifications = {
  // Listing notifications
  listing_approved: {
    title: "Your item is live! 🎉",
    body: "{{item_title}} is now visible to buyers",
    action: "view_listing"
  },

  listing_rejected: {
    title: "Listing needs attention",
    body: "{{item_title}} couldn't be approved. Tap to see why.",
    action: "edit_listing"
  },

  new_inquiry: {
    title: "Someone's interested!",
    body: "{{buyer_name}} asked about {{item_title}}",
    action: "open_chat"
  },

  price_offer: {
    title: "New offer received 💰",
    body: "{{buyer_name}} offered ₩{{amount}} for {{item_title}}",
    action: "open_chat"
  },

  // Transaction notifications
  transaction_agreed: {
    title: "Deal confirmed! 🤝",
    body: "You and {{other_party}} agreed on {{item_title}}",
    action: "view_transaction"
  },

  meetup_reminder: {
    title: "Meetup tomorrow",
    body: "Don't forget: {{item_title}} with {{other_party}} at {{location}}",
    action: "view_transaction"
  },

  transaction_completed: {
    title: "Transaction complete! ⭐",
    body: "How was your experience with {{other_party}}?",
    action: "leave_review"
  },

  // Engagement notifications
  similar_items: {
    title: "Items you might like",
    body: "New listings similar to {{search_term}}",
    action: "view_recommendations"
  },

  price_drop: {
    title: "Price dropped! 📉",
    body: "{{item_title}} is now ₩{{new_price}} (was ₩{{old_price}})",
    action: "view_listing"
  },

  // Re-engagement
  inactive_seller: {
    title: "Your listings miss you 👋",
    body: "Update your prices to attract buyers",
    action: "manage_listings"
  },

  inactive_buyer: {
    title: "New deals waiting for you",
    body: "{{count}} new items in categories you browse",
    action: "browse_marketplace"
  }
};
```

### 8.5 Re-engagement Campaign Ideas

| Campaign | Target | Trigger | Channel | Offer |
|----------|--------|---------|---------|-------|
| **Lapsed Seller** | No listings in 30 days | Day 31 | Push + Email | "List 3 items, get featured badge" |
| **Abandoned Listing** | Draft not submitted (3 days) | Day 4 | Push | "Finish your listing — buyers waiting!" |
| **Post-PCS Outreach** | User marked as PCS'ing | +14 days | Email | "Settling in? Find deals from neighbors" |
| **Review Reminder** | Completed transaction, no review | +3 days | Push | "Help the community — leave a review" |
| **Seasonal Push** | All active users | Season change | Push + Banner | "Spring cleaning? List your winter gear" |
| **Price Update Nudge** | Listing 14+ days, no inquiries | Day 15 | In-app | "Tip: Try lowering your price by 10%" |
| **Verification Drive** | Unverified sellers | Weekly | Email | "Get verified = more buyer trust" |
| **Category Education** | New sellers | After first listing | In-app | "Pro tip: Items in {{category}} sell 2x faster with 5+ photos" |

---

## 9. Database Schema

### 9.1 New Tables for Marketplace

```sql
-- Categories table
CREATE TABLE marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_ko VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES marketplace_categories(id),
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_verification BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Items table
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),

  -- Content
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price BIGINT NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) DEFAULT 'KRW',

  -- Categorization
  category_id UUID NOT NULL REFERENCES marketplace_categories(id),
  condition VARCHAR(20) NOT NULL CHECK (condition IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')),

  -- Location
  location_type VARCHAR(20) DEFAULT 'HUMPREYS' CHECK (location_type IN ('HUMPREYS', 'OSAN', 'BOTH')),
  meetup_location TEXT,
  shipping_available BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'RESERVED', 'HIDDEN', 'DELETED')),
  moderation_status VARCHAR(20) DEFAULT 'PENDING' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')),
  rejection_reason TEXT,
  moderation_notes TEXT,
  moderated_by UUID REFERENCES admins(id),
  moderated_at TIMESTAMPTZ,

  -- Metadata
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  inquiry_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_negotiable BOOLEAN DEFAULT true,
  is_urgent BOOLEAN DEFAULT false,
  risk_score INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100)
);

-- Item images
CREATE TABLE marketplace_item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INT DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User marketplace profile
CREATE TABLE marketplace_user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),

  -- Status
  marketplace_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (marketplace_status IN ('ACTIVE', 'RESTRICTED', 'SUSPENDED', 'BANNED')),
  can_sell BOOLEAN DEFAULT true,
  can_buy BOOLEAN DEFAULT true,
  can_message BOOLEAN DEFAULT true,

  -- Reputation
  seller_rating DECIMAL(2,1),
  buyer_rating DECIMAL(2,1),
  total_sales INT DEFAULT 0,
  total_purchases INT DEFAULT 0,
  completed_transactions INT DEFAULT 0,
  cancelled_transactions INT DEFAULT 0,

  -- Verification
  is_verified_seller BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_method VARCHAR(20),

  -- Risk
  risk_score INT DEFAULT 0,
  report_count INT DEFAULT 0,
  warning_count INT DEFAULT 0,
  last_warning_at TIMESTAMPTZ,
  restriction_reason TEXT,
  restricted_until TIMESTAMPTZ,

  -- Activity
  last_listing_at TIMESTAMPTZ,
  last_purchase_at TIMESTAMPTZ,
  response_rate DECIMAL(5,2),
  avg_response_time INT, -- in minutes

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat rooms
CREATE TABLE marketplace_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),

  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'BLOCKED')),
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,

  message_count INT DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(item_id, buyer_id)
);

-- Chat messages
CREATE TABLE marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES marketplace_chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),

  content TEXT,
  message_type VARCHAR(20) DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'LOCATION', 'OFFER', 'SYSTEM')),
  offer_amount BIGINT,

  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  is_hidden BOOLEAN DEFAULT false,
  hidden_by UUID REFERENCES admins(id),

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  chat_room_id UUID REFERENCES marketplace_chat_rooms(id),

  -- Pricing
  listing_price BIGINT NOT NULL,
  final_price BIGINT NOT NULL,
  platform_fee BIGINT DEFAULT 0,
  fee_percentage DECIMAL(5,2) DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'INITIATED' CHECK (status IN (
    'INITIATED', 'AGREED', 'PAYMENT_PENDING', 'PAID',
    'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED',
    'DISPUTED', 'REFUNDED'
  )),

  -- Payment
  payment_method VARCHAR(20),
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,

  -- Delivery
  delivery_method VARCHAR(20) CHECK (delivery_method IN ('MEETUP', 'SHIPPING', 'PICKUP')),
  meetup_location TEXT,
  meetup_time TIMESTAMPTZ,
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Completion
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20),

  -- Dispute
  has_dispute BOOLEAN DEFAULT false,
  dispute_id UUID,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES marketplace_transactions(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),

  reviewer_role VARCHAR(10) NOT NULL CHECK (reviewer_role IN ('BUYER', 'SELLER')),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  is_hidden BOOLEAN DEFAULT false,
  hidden_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(transaction_id, reviewer_id)
);

-- Reports
CREATE TABLE marketplace_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reporter_type VARCHAR(10) CHECK (reporter_type IN ('BUYER', 'SELLER', 'VIEWER')),

  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('ITEM', 'USER', 'CHAT', 'TRANSACTION', 'REVIEW')),
  target_id UUID NOT NULL,

  category VARCHAR(30) NOT NULL,
  subcategory VARCHAR(50),
  description TEXT,
  evidence_urls JSONB DEFAULT '[]',

  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED')),
  priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),

  assigned_to UUID REFERENCES admins(id),
  resolution TEXT,
  action_taken VARCHAR(30),
  resolved_by UUID REFERENCES admins(id),
  resolved_at TIMESTAMPTZ,

  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES marketplace_reports(id),
  auto_flagged BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disputes
CREATE TABLE marketplace_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES marketplace_transactions(id),

  initiator_id UUID NOT NULL REFERENCES users(id),
  initiator_role VARCHAR(10) NOT NULL CHECK (initiator_role IN ('BUYER', 'SELLER')),
  respondent_id UUID NOT NULL REFERENCES users(id),

  reason VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  desired_outcome VARCHAR(30),
  desired_amount BIGINT,

  evidence JSONB DEFAULT '[]',

  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN (
    'OPEN', 'PEER_RESOLUTION', 'ADMIN_REVIEW', 'DECIDED', 'APPEALED', 'CLOSED'
  )),
  stage INT DEFAULT 1,

  decision VARCHAR(20),
  decision_reason TEXT,
  refund_amount BIGINT,
  decided_by UUID REFERENCES admins(id),
  decided_at TIMESTAMPTZ,

  appeal_filed BOOLEAN DEFAULT false,
  appeal_reason TEXT,
  appeal_evidence JSONB DEFAULT '[]',
  appeal_decision VARCHAR(20),
  appeal_decided_by UUID REFERENCES admins(id),
  appeal_decided_at TIMESTAMPTZ,

  actions_taken JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  peer_resolution_deadline TIMESTAMPTZ,
  admin_decision_deadline TIMESTAMPTZ
);

-- User warnings
CREATE TABLE marketplace_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  type VARCHAR(30) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE')),
  message TEXT NOT NULL,

  related_report_id UUID REFERENCES marketplace_reports(id),
  related_item_id UUID REFERENCES marketplace_items(id),
  related_chat_id UUID REFERENCES marketplace_chat_rooms(id),
  evidence_notes TEXT,

  issued_by UUID NOT NULL REFERENCES admins(id),
  issued_at TIMESTAMPTZ DEFAULT now(),

  acknowledged_at TIMESTAMPTZ,
  user_response TEXT,

  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites
CREATE TABLE marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  item_id UUID NOT NULL REFERENCES marketplace_items(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, item_id)
);

-- Moderation rules (for auto-moderation)
CREATE TABLE marketplace_moderation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,

  conditions JSONB NOT NULL,
  condition_logic VARCHAR(5) DEFAULT 'AND',

  action VARCHAR(20) NOT NULL,
  risk_score_impact INT DEFAULT 0,
  notification_type VARCHAR(20) DEFAULT 'ADMIN_ONLY',

  hit_count INT DEFAULT 0,
  false_positive_count INT DEFAULT 0,

  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin action logs
CREATE TABLE marketplace_admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),

  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,

  previous_state JSONB,
  new_state JSONB,
  reason TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_items_seller ON marketplace_items(seller_id);
CREATE INDEX idx_items_category ON marketplace_items(category_id);
CREATE INDEX idx_items_status ON marketplace_items(status);
CREATE INDEX idx_items_mod_status ON marketplace_items(moderation_status);
CREATE INDEX idx_items_created ON marketplace_items(created_at DESC);
CREATE INDEX idx_items_location ON marketplace_items(location_type);

CREATE INDEX idx_chat_rooms_item ON marketplace_chat_rooms(item_id);
CREATE INDEX idx_chat_rooms_users ON marketplace_chat_rooms(seller_id, buyer_id);
CREATE INDEX idx_messages_room ON marketplace_messages(chat_room_id, created_at DESC);

CREATE INDEX idx_transactions_item ON marketplace_transactions(item_id);
CREATE INDEX idx_transactions_users ON marketplace_transactions(seller_id, buyer_id);
CREATE INDEX idx_transactions_status ON marketplace_transactions(status);

CREATE INDEX idx_reports_status ON marketplace_reports(status, priority);
CREATE INDEX idx_reports_target ON marketplace_reports(target_type, target_id);
CREATE INDEX idx_disputes_transaction ON marketplace_disputes(transaction_id);

CREATE INDEX idx_favorites_user ON marketplace_favorites(user_id);
CREATE INDEX idx_favorites_item ON marketplace_favorites(item_id);
```

---

## 10. API Endpoints

### 10.1 Admin API Routes

```typescript
// Item Management
GET    /api/admin/marketplace/items                    // List all items (with filters)
GET    /api/admin/marketplace/items/:id                // Get item details
PATCH  /api/admin/marketplace/items/:id                // Update item (status, category, etc.)
POST   /api/admin/marketplace/items/:id/approve        // Approve item
POST   /api/admin/marketplace/items/:id/reject         // Reject item with reason
POST   /api/admin/marketplace/items/:id/hide           // Hide item
POST   /api/admin/marketplace/items/:id/unhide         // Unhide item
DELETE /api/admin/marketplace/items/:id                // Soft delete item
POST   /api/admin/marketplace/items/bulk               // Bulk actions

// User Management
GET    /api/admin/marketplace/users                    // List marketplace users
GET    /api/admin/marketplace/users/:id                // Get user marketplace profile
PATCH  /api/admin/marketplace/users/:id                // Update user status
POST   /api/admin/marketplace/users/:id/warn           // Issue warning
POST   /api/admin/marketplace/users/:id/restrict       // Restrict account
POST   /api/admin/marketplace/users/:id/suspend        // Suspend account
POST   /api/admin/marketplace/users/:id/ban            // Ban account
POST   /api/admin/marketplace/users/:id/verify         // Verify seller

// Transactions
GET    /api/admin/marketplace/transactions             // List transactions
GET    /api/admin/marketplace/transactions/:id         // Get transaction details
PATCH  /api/admin/marketplace/transactions/:id         // Update transaction status

// Reports
GET    /api/admin/marketplace/reports                  // List reports
GET    /api/admin/marketplace/reports/:id              // Get report details
PATCH  /api/admin/marketplace/reports/:id              // Update report (status, assign)
POST   /api/admin/marketplace/reports/:id/resolve      // Resolve report
POST   /api/admin/marketplace/reports/:id/escalate     // Escalate report

// Disputes
GET    /api/admin/marketplace/disputes                 // List disputes
GET    /api/admin/marketplace/disputes/:id             // Get dispute details
PATCH  /api/admin/marketplace/disputes/:id             // Update dispute status
POST   /api/admin/marketplace/disputes/:id/decide      // Make decision

// Chat Monitoring
GET    /api/admin/marketplace/chats                    // List chat rooms (flagged)
GET    /api/admin/marketplace/chats/:id                // Get chat room with messages
POST   /api/admin/marketplace/chats/:id/flag           // Flag chat room
POST   /api/admin/marketplace/messages/:id/hide        // Hide message

// Analytics
GET    /api/admin/marketplace/analytics/overview       // Dashboard metrics
GET    /api/admin/marketplace/analytics/transactions   // Transaction analytics
GET    /api/admin/marketplace/analytics/users          // User analytics
GET    /api/admin/marketplace/analytics/moderation     // Moderation analytics
GET    /api/admin/marketplace/analytics/export         // Export report data

// Settings
GET    /api/admin/marketplace/settings                 // Get marketplace settings
PATCH  /api/admin/marketplace/settings                 // Update settings
GET    /api/admin/marketplace/categories               // List categories
POST   /api/admin/marketplace/categories               // Create category
PATCH  /api/admin/marketplace/categories/:id           // Update category

// Moderation Rules
GET    /api/admin/marketplace/rules                    // List moderation rules
POST   /api/admin/marketplace/rules                    // Create rule
PATCH  /api/admin/marketplace/rules/:id                // Update rule
DELETE /api/admin/marketplace/rules/:id                // Delete rule
```

### 10.2 Request/Response Examples

```typescript
// GET /api/admin/marketplace/items?status=PENDING&page=1&limit=10
// Response
{
  "items": [
    {
      "id": "uuid",
      "title": "iPhone 14 Pro",
      "price": 800000,
      "currency": "KRW",
      "seller": {
        "id": "uuid",
        "username": "john_doe",
        "seller_rating": 4.8,
        "risk_score": 12
      },
      "category": {
        "id": "uuid",
        "name": "Electronics"
      },
      "status": "PENDING",
      "moderation_status": "PENDING",
      "risk_score": 25,
      "images": [
        { "url": "...", "is_main": true }
      ],
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "pages": 3
  },
  "stats": {
    "pending": 23,
    "active": 1245,
    "flagged": 12
  }
}

// POST /api/admin/marketplace/items/:id/reject
// Request
{
  "reason": "COUNTERFEIT",
  "notes": "Item appears to be a replica based on image analysis. Price significantly below market for authentic item."
}

// Response
{
  "success": true,
  "item": {
    "id": "uuid",
    "status": "PENDING",
    "moderation_status": "REJECTED",
    "rejection_reason": "COUNTERFEIT",
    "moderated_by": "admin_uuid",
    "moderated_at": "2024-01-20T12:00:00Z"
  },
  "actions": [
    {
      "type": "ITEM_REJECTED",
      "notification_sent": true
    }
  ]
}

// POST /api/admin/marketplace/disputes/:id/decide
// Request
{
  "decision": "BUYER_WINS",
  "decision_reason": "Seller provided item significantly different from listing description. Photos show clear discrepancy.",
  "refund_amount": 800000,
  "additional_actions": [
    {
      "type": "WARNING_ISSUED",
      "target_user_id": "seller_uuid",
      "details": "Misrepresentation warning"
    }
  ]
}

// Response
{
  "success": true,
  "dispute": {
    "id": "uuid",
    "status": "DECIDED",
    "decision": "BUYER_WINS",
    "decision_reason": "...",
    "refund_amount": 800000,
    "decided_by": "admin_uuid",
    "decided_at": "2024-01-20T14:00:00Z",
    "actions_taken": [...]
  },
  "notifications": [
    { "user_id": "buyer_uuid", "type": "DISPUTE_RESOLVED_IN_FAVOR" },
    { "user_id": "seller_uuid", "type": "DISPUTE_RESOLVED_AGAINST" }
  ]
}
```

---

## Appendix A: Checklist for Implementation

### MVP Launch Checklist

- [ ] **Database**
  - [ ] All tables created with indexes
  - [ ] RLS policies configured
  - [ ] Migration scripts tested

- [ ] **Admin UI**
  - [ ] Item list with filters
  - [ ] Item detail & moderation
  - [ ] User list with marketplace tab
  - [ ] Report queue
  - [ ] Basic dashboard

- [ ] **API**
  - [ ] Item CRUD endpoints
  - [ ] Moderation endpoints
  - [ ] Report endpoints
  - [ ] Analytics endpoints

- [ ] **Moderation**
  - [ ] Basic keyword filter
  - [ ] Manual review queue
  - [ ] Status transitions

- [ ] **Documentation**
  - [ ] ToS finalized
  - [ ] Prohibited items policy
  - [ ] Safe trading guide

### V2 Checklist

- [ ] Auto-moderation pipeline
- [ ] Risk scoring system
- [ ] Advanced analytics dashboard
- [ ] Dispute resolution workflow
- [ ] Bulk operations
- [ ] Chat monitoring

### V3 Checklist

- [ ] ML fraud detection
- [ ] Recommendation engine
- [ ] Automated CS triage
- [ ] A/B testing framework
- [ ] Predictive analytics

---

*Document Version: 1.0*
*Last Updated: January 2024*
*Author: AI Assistant*
