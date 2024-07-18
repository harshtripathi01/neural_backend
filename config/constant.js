module.exports = {
    //LOGIN METHODS
    WEBSITE_URL:{
        LOCAL:"http://localhost:3000/",
        DEV:"https://dev.talencred.com/",
        STAGING:"https://beta.talencred.com/",
        LIVE:"https://talencred.com/"
    },
    EMAIL:"email",
    MOBILE: "mobile",
    GOOGLE: "google",
    FACEBOOK: "facebook",
    LOGIN: "login",
    DELIVERY: "delivery",

    //  SMS  PLATFORMS

    TWILIO: "twilio",
    MSG91: "msg91",

    PERMISSONS:["all", "read", "update", "delete", "suspend"],

    SUPERADMIN: "superadmin",
    CUSTOMER:"customer",


    ALL: "all",
    READ: "read",
    UPDATE: "update",
    DELETE: "delete",
    SUSPEND: "suspend",

    //
    ADDRESS:"address",
    ADMIN:"admin",
    BANNER:"banner",
    BRAND:"brand",
    CART_ITEM: "cartitem",
    CATEGORY:"category",
    COLLECTION:"collection",
    FILTER:"filter",
    FILTER_OPTIONS:"filterOptions",
    FILTER_VALUES:"filterValues",
    HOMEPAGE:"homepage",
    INVOICE:"invoice",
    OFFERS:"offers",
    ORDER:"order",
    PRODUCT:"product",
    RATING:"rating",
    REVIEW:"review",
    ROLE_PERMISSION:"role_permission",
    USER:"user",
    VARIANT:"variant",
    PROPOSAL: "proposal",
    PAYMENT_REQUEST : "payment_request",

    JOB_SORT_BY:{
        MOST_RELEVANT:"most_relevant",
        MOST_RECENT: "most_recent",
        HIGH_TO_LOW: "high_to_low",
        LOW_TO_HIGH: "low_to_high"
    },

    VERIFICATION_STATUS: {
        PENDING: "pending",
        VERIFIED: "verified",
        UNVERIFIED: "unverified",
    },
 

    GENDER: {
        MALE: "male",
        FEMALE: "female",
        OTHERS: "others",
        PREFERRED_NOT_TO_SAY:"preferred_not_to_say",
        TRANSGENDER: "transgender",
    },


    USER_STATUS: {
        ACTIVE: "active",
        PENDING: "pending",
        SUSPENDED: "suspended",
        REJECTED:"rejected",
    },


    EXPERIENCE_LEVEL: {
        BEGINNER: "beginner",
        INTERMEDIATE: "intermediate",
        EXPERT: "expert",
    },

    PROJECT_LENGTH: {
        LESS_THAN_ONE_MONTH: "less_than_one_month",
        ONE_TO_THREE_MONTHS: "one_to_three_months",
        THREE_TO_SIX_MONTHS: "three_to_six_months",
        MORE_THAN_SIX_MONTHS: "more_than_six_months"
    },
    
    USER_TYPE: {
        AGENCY: "agency",
        INDIVIDUAL: "individual",
        AGENCY_DEVELOPER: "agency_developer",
        AGENCY_SALES:"agency_sales",
        AGENCY_ACCOUNTS: "agency_accounts",
        CLIENT: "client"
    },


    JOB_TYPE: {
        HOURLY: "hourly",
        FIXED_PRICE: "fixed_price",
    },


    MILESTONE_STATUS: {
        PENDING: "pending",
        IN_PROGRESS: "in_progress",
        COMPLETED: "completed",
        DELAYED:"delayed",
        CANCELLED: "cancelled",
        ON_HOLD: "on_hold"
    },


    WORK_DIARY_STATUS: {
        PENDING: "pending",
        RECEIVED: "received",
        CANCELLED: "cancelled",
        ON_HOLD: "on_hold",
        REPORTED: "reported",
    },


    QUESTION_TYPE: {
        SHORT_ANSWER: "short_answer",
        LONG_ANSWER: "long_answer",
        MULTIPLE_CHOICE: "multiple_choice",
    },


    TIME_PARAMETER: {
        DAYS: "days",
        WEEKS: "weeks",
        MONTHS: "months",
    },


    CURRENCY: {
        USD: "USD",
        EUD: "EUR",
        RUPEE: "RUPEE",
    },
    
    

    HOLD_REASON: {
        WAITING_FOR_PAYMENT: "waiting_for_payment",
        DEPENDENCIES_ON_CLIENT: "dependencies_on_client",
        CLIENT_NOT_RESPONDING: "client_not_responding",
        DELAYED:"other",
    },


    REPORTING_REASON: {
        FRAUD: "fraud",
        RIGHT_SIZED_EMPOWERING_LEVERAGE: "right_sized_empowering_leverage",
        INTEGRATED_RADICAL_GROUPWARE: "integrated_radical_groupware",
        USER_FRIENDLY_BOTTOM_LINE_ANALYZER:"user_friendly_bottom_line_analyzer",
        OTHER: "other"
    },


    REJECTION_REASON: {
        NOT_RELATED_TO_MY_PROFILE: "not_related_to_my_profile",
        SKILLS_ARE_NOT_MATCHING: "skills_are_not_matching",
        ESTIMATE_TIME_IS_TOO_SHORT: "estimate_time_is_too_short",
        BUDGET_IS_LOW:"budget_is_low",
        OTHER: "other"
    },

    PROPOSAL_STATUS: {
        REJECTED_PROPOSAL: "rejected_proposal",
        ACCEPTED_PROPOSAL_: "accepted_proposal",
        PROPOSAL_SENT: "proposal_sent",
        CONTRACT_SENT: "contract_sent",
        REQUEST_FOR_PAYMENT:"payment_request",
        PROPOSAL_DRAFT: "proposal_draft",
        INTERVIEWING: "interviewing"
    },

    CHAT_TYPE:{
        PROPOSAL:"proposal",
        WORK_DIARY:"work_diary"
    },

    INVITE_STATUS:{
        PENDING: "pending",
        ACCEPTED: "accepted",
        REJECTED: "rejected"
    },

    CHAT_MESSAGE:{
        UPDATE_PROPOSAL: "Proposal has been updated",
        PAYMENT_REQUEST: "payment_request"

    },


    SCOPE_WORD_LIMIT: 500,
    
    PRODUCT_WORD_DESCRIPTION_LIMIT: 250,

    TITLE_LIMIT: 3,

    USER_STATUS: ["pending","active","inactive","approved", "rejected", "invite_sent"]


}