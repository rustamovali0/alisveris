"use client";

import {
  BarChart3,
  Bell,
  CreditCard,
  Heart,
  Lock,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"