"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { motion } from "motion/react";
import { ActionTab } from "./tabs/action-tab";
import { FriendsTab } from "./tabs/friends-tab";
import { GrowthTab } from "./tabs/growth-tab";
import { MilestoneTab } from "./tabs/milestone-tab";
import { MonthlyTab } from "./tabs/monthly-tab";
import { OverviewTab } from "./tabs/overview-tab";
import type { QuarterlyReportData } from "./types";

const TABS = [
  { value: "overview", label: "總覽" },
  { value: "monthly", label: "月記" },
  { value: "milestone", label: "里程碑" },
  { value: "friends", label: "島友" },
  { value: "growth", label: "成長" },
  { value: "action", label: "行動" },
] as const;

interface QuarterlyReportPageProps {
  data: QuarterlyReportData;
}

export function QuarterlyReportPage({ data }: QuarterlyReportPageProps) {
  return (
    <div>
      <motion.div
        className="px-5 pt-4 pb-2 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-text-dark">{data.user.name}的季度報告</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {data.quarter.year} Q{data.quarter.quarter} · {data.user.transition}
        </p>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList className="overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OverviewTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="monthly">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MonthlyTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="milestone">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MilestoneTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="friends">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FriendsTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="growth">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GrowthTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="action">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActionTab data={data} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
