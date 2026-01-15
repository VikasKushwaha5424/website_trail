{ name: "Rate Faculty", path: "/student/feedback", icon: <Star size={20} /> }

/// File: client/src/components/StudentLayout.jsx (Or whichever sidebar you use for students)

Import MousePointerClick from lucide-react.

Add Item: { name: "Electives", path: "/student/electives", icon: <MousePointerClick size={20} /> }. ///

In client/src/components/StudentLayout.jsx:

Add to navItems:

JavaScript
import { CreditCard } from "lucide-react";
// ...
{ name: "ID Card", path: "/student/id-card", icon: <CreditCard size={20} /> }

