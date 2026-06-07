"use client";

import { cn } from "@daodao/ui/lib/utils";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type NodeStatus = "seed" | "solid" | "cooling";

interface SkillNodeData {
  id: string;
  label: string;
  primaryPillar: string;
  secondaryPillars: string[];
  level4Subskills: string[];
  status: NodeStatus;
  footprintCount: number;
  pinnedFootprint?: string;
  reasoningTw?: string;
}

interface PillarDef {
  id: string;
  label: string;
}

const WEF_PILLARS: PillarDef[] = [
  { id: "analytical_thinking", label: "分析思考" },
  { id: "creative_thinking", label: "創造性思考" },
  { id: "resilience_agility", label: "韌性適應力" },
  { id: "motivation_self_awareness", label: "自我覺察" },
  { id: "empathy_listening", label: "同理傾聽" },
  { id: "leadership_influence", label: "領導影響力" },
  { id: "tech_literacy", label: "數位素養" },
  { id: "systems_ai_competency", label: "系統與 AI" },
];

const MOCK_NODES: SkillNodeData[] = [
  {
    id: "n1",
    label: "PeBL 閱讀研究",
    primaryPillar: "motivation_self_awareness",
    secondaryPillars: ["empathy_listening"],
    level4Subskills: ["自我反思", "閱讀理解", "主動學習"],
    status: "solid",
    footprintCount: 18,
    pinnedFootprint: "「PeBL 不只培養技能，而是幫助你看見自己」",
    reasoningTw: "從你持續閱讀與反思的過程中，展現了深度的自我覺察與學習動力！",
  },
  {
    id: "n2",
    label: "Human Library",
    primaryPillar: "empathy_listening",
    secondaryPillars: ["creative_thinking"],
    level4Subskills: ["主動傾聽", "跨文化理解", "同理心"],
    status: "solid",
    footprintCount: 5,
    pinnedFootprint: "「就跟借書一樣，可以借一個人來進行對談」",
    reasoningTw: "探索 Human Library 展現了你對人際連結與同理傾聽的敏銳度。",
  },
  {
    id: "n3",
    label: "反思日誌",
    primaryPillar: "motivation_self_awareness",
    secondaryPillars: [],
    level4Subskills: ["自我反思", "後設認知", "習慣養成"],
    status: "solid",
    footprintCount: 12,
    pinnedFootprint: "「互動本身就是思考」",
    reasoningTw: "寫反思日誌是你維持動力的關鍵——反思已成為你學習的一部分。",
  },
  {
    id: "n4",
    label: "社群動態觀察",
    primaryPillar: "empathy_listening",
    secondaryPillars: ["leadership_influence"],
    level4Subskills: ["社群觀察", "合作學習", "回饋循環"],
    status: "solid",
    footprintCount: 8,
    pinnedFootprint: "「最好的社群不是被管理的，是被滋養的」",
    reasoningTw: "你對社群動態的觀察結合了同理傾聽與領導思維。",
  },
  {
    id: "n5",
    label: "社群設計原則",
    primaryPillar: "creative_thinking",
    secondaryPillars: ["leadership_influence"],
    level4Subskills: ["創新設計", "系統思考", "使用者中心"],
    status: "solid",
    footprintCount: 4,
    reasoningTw: "將社群運營轉化為設計原則，展現了你的創造性思考能力。",
  },
  {
    id: "n6",
    label: "學習介面設計",
    primaryPillar: "creative_thinking",
    secondaryPillars: ["tech_literacy"],
    level4Subskills: ["UI 設計", "互動設計", "資訊架構"],
    status: "solid",
    footprintCount: 3,
    pinnedFootprint: "「降低摩擦力比增加功能重要一百倍」",
    reasoningTw: "從理論轉向動手設計，你的創造性思考正在開花結果！",
  },
  {
    id: "n7",
    label: "Figma 原型",
    primaryPillar: "tech_literacy",
    secondaryPillars: ["creative_thinking"],
    level4Subskills: ["Figma", "原型設計", "視覺呈現"],
    status: "seed",
    footprintCount: 2,
    reasoningTw: "Figma 技能正在萌芽——再多幾次實踐就會茁壯！",
  },
  {
    id: "n8",
    label: "使用者訪談",
    primaryPillar: "empathy_listening",
    secondaryPillars: ["analytical_thinking"],
    level4Subskills: ["訪談技巧", "質性分析", "使用者研究"],
    status: "seed",
    footprintCount: 2,
    reasoningTw: "使用者訪談結合了你的同理傾聽天賦與分析能力。",
  },
  {
    id: "n9",
    label: "Python 自動化",
    primaryPillar: "systems_ai_competency",
    secondaryPillars: [],
    level4Subskills: ["Python", "自動化流程"],
    status: "seed",
    footprintCount: 1,
    reasoningTw: "自動化的種子已經種下——未來可以大幅提升效率！",
  },
  {
    id: "n10",
    label: "資料分析",
    primaryPillar: "analytical_thinking",
    secondaryPillars: [],
    level4Subskills: ["數據分析", "邏輯推理"],
    status: "seed",
    footprintCount: 1,
    reasoningTw: "分析思考是所有學習的基礎——這顆種子會長得很大。",
  },
];

const STATUS_LABEL: Record<NodeStatus, { text: string; className: string }> = {
  solid: { text: "已點亮", className: "bg-light-blue text-logo-cyan" },
  seed: { text: "種子", className: "bg-very-light-gray text-light-gray" },
  cooling: { text: "冷卻中", className: "bg-very-light-gray text-light-gray" },
};

const GRAPH_WIDTH = 360;
const GRAPH_HEIGHT = 520;
const GRAPH_MARGIN = 28;

type GraphNodeType = "pillar" | "skill";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  radius: number;
  type: GraphNodeType;
  indexLabel?: string;
  pillarId?: string;
  sourceNode?: SkillNodeData;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

function getSkillRadius(footprintCount: number) {
  return Math.min(7 + footprintCount * 0.35, 14);
}

function getPillarNodes(pillarId: string) {
  return MOCK_NODES.filter((node) => node.primaryPillar === pillarId);
}

function createPillarAnchor(index: number) {
  const columns = [100, 260];
  const row = Math.floor(index / columns.length);
  const column = index % columns.length;

  return {
    x: columns[column] ?? GRAPH_WIDTH / 2,
    y: 76 + row * 130,
  };
}

function resolveNodeId(node: string | GraphNode) {
  return typeof node === "string" ? node : node.id;
}

function createGraphLayout() {
  const referencedPillarIds = new Set(
    MOCK_NODES.flatMap((node) => [node.primaryPillar, ...node.secondaryPillars])
  );
  const activePillars = WEF_PILLARS.map((pillar) => ({
    pillar,
    nodes: getPillarNodes(pillar.id),
  })).filter((group) => referencedPillarIds.has(group.pillar.id));

  const pillarNodes: GraphNode[] = activePillars.map(({ pillar }, index) => {
    const anchor = createPillarAnchor(index);
    return {
      id: pillar.id,
      label: pillar.label,
      radius: 16,
      type: "pillar",
      indexLabel: String(index + 1),
      x: anchor.x,
      y: anchor.y,
      fx: anchor.x,
      fy: anchor.y,
    };
  });

  const skillNodes: GraphNode[] = MOCK_NODES.map((node, index) => {
    const pillarIndex = activePillars.findIndex((group) => group.pillar.id === node.primaryPillar);
    const anchor = createPillarAnchor(Math.max(pillarIndex, 0));
    const offset = index % 2 === 0 ? -34 : 34;

    return {
      id: node.id,
      label: node.label,
      radius: getSkillRadius(node.footprintCount),
      type: "skill",
      pillarId: node.primaryPillar,
      sourceNode: node,
      x: anchor.x + offset,
      y: anchor.y + 44 + (index % 3) * 18,
    };
  });

  const links: GraphLink[] = MOCK_NODES.flatMap((node) => {
    const primaryLink: GraphLink = { source: node.primaryPillar, target: node.id };
    const secondaryLinks = node.secondaryPillars.map<GraphLink>((pillarId) => ({
      source: pillarId,
      target: node.id,
    }));
    return [primaryLink, ...secondaryLinks];
  });

  const nodes = [...pillarNodes, ...skillNodes];

  const simulation = forceSimulation<GraphNode>(nodes)
    .force(
      "link",
      forceLink<GraphNode, GraphLink>(links)
        .id((node) => node.id)
        .distance((link) => {
          const sourceId = resolveNodeId(link.source);
          const targetId = resolveNodeId(link.target);
          const target = nodes.find((node) => node.id === targetId);
          const source = nodes.find((node) => node.id === sourceId);
          if (source?.type === "pillar" && target?.type === "skill") return 56;
          return 86;
        })
        .strength(0.7)
    )
    .force(
      "charge",
      forceManyBody<GraphNode>().strength((node) => (node.type === "pillar" ? -80 : -140))
    )
    .force("center", forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
    .force("x", forceX<GraphNode>(GRAPH_WIDTH / 2).strength(0.03))
    .force("y", forceY<GraphNode>(GRAPH_HEIGHT / 2).strength(0.025))
    .force(
      "collide",
      forceCollide<GraphNode>()
        .radius((node) => node.radius + 24)
        .iterations(3)
    )
    .stop();

  for (let i = 0; i < 260; i++) {
    simulation.tick();
  }

  for (const node of nodes) {
    node.x = Math.min(
      Math.max(node.x ?? GRAPH_WIDTH / 2, GRAPH_MARGIN),
      GRAPH_WIDTH - GRAPH_MARGIN
    );
    node.y = Math.min(
      Math.max(node.y ?? GRAPH_HEIGHT / 2, GRAPH_MARGIN),
      GRAPH_HEIGHT - GRAPH_MARGIN
    );
  }

  return { nodes, links };
}

export function SkillGalaxy() {
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);

  const graph = useMemo(() => createGraphLayout(), []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-light-cyan bg-white p-4">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-20 right-4 size-44 rounded-full bg-logo-cyan/10 blur-3xl" />
        <div className="absolute bottom-16 -left-16 size-52 rounded-full bg-logo-cyan/10 blur-3xl" />
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          className="h-[520px] w-full"
          role="img"
          aria-label="技能成長 D3 關聯圖"
        >
          <g>
            {graph.links.map((link) => {
              const sourceId = resolveNodeId(link.source);
              const targetId = resolveNodeId(link.target);
              const source = graph.nodes.find((node) => node.id === sourceId);
              const target = graph.nodes.find((node) => node.id === targetId);
              if (!source || !target) return null;

              return (
                <line
                  key={`${sourceId}-${targetId}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className="stroke-logo-cyan/25"
                  strokeWidth={1.2}
                />
              );
            })}
          </g>

          <g>
            {graph.nodes.map((node) => {
              const isSkill = node.type === "skill";
              const sourceNode = node.sourceNode;
              const isSelected = selectedNode?.id === sourceNode?.id;

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={isSkill ? "cursor-pointer" : undefined}
                  onClick={() => {
                    if (sourceNode) setSelectedNode(isSelected ? null : sourceNode);
                  }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + (isSelected ? 5 : 0)}
                    className={cn(
                      isSkill ? "fill-white stroke-logo-cyan" : "fill-light-blue stroke-logo-cyan",
                      isSelected && "fill-light-blue"
                    )}
                    strokeWidth={isSkill ? 2 : 1.5}
                  />
                  {isSkill && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={Math.max(3, node.radius - 4)}
                      className={
                        sourceNode?.status === "seed"
                          ? "fill-white stroke-logo-cyan"
                          : "fill-logo-cyan"
                      }
                      strokeWidth={sourceNode?.status === "seed" ? 1.4 : 0}
                    />
                  )}
                  {!isSkill && (
                    <text
                      x={node.x}
                      y={(node.y ?? 0) + 4}
                      textAnchor="middle"
                      className="fill-logo-cyan text-[10px] font-semibold"
                    >
                      {node.indexLabel}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </g>

          <g className="pointer-events-none">
            {graph.nodes
              .filter((node) => node.type === "skill")
              .map((node) => {
              return (
                <text
                  key={`label-${node.id}`}
                    x={node.x}
                    y={(node.y ?? 0) + node.radius + 14}
                  textAnchor="middle"
                    className="fill-text-dark text-[10px] font-semibold"
                >
                  {node.label}
                </text>
              );
              })}
          </g>
        </svg>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {WEF_PILLARS.filter((pillar) =>
            MOCK_NODES.some(
              (node) =>
                node.primaryPillar === pillar.id || node.secondaryPillars.includes(pillar.id)
            )
          ).map((pillar, index) => {
            return (
              <div key={pillar.id} className="flex items-center gap-2 text-[10px] text-light-gray">
                <span className="flex size-5 items-center justify-center rounded-full bg-light-blue text-logo-cyan">
                  {index + 1}
                </span>
                <span className="truncate">{pillar.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 border-t border-light-cyan shadow-lg"
          >
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute top-3 right-3 text-light-gray hover:text-text-dark"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="size-3 rounded-full bg-logo-cyan" />
              <h3 className="text-sm font-medium text-text-dark">{selectedNode.label}</h3>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  STATUS_LABEL[selectedNode.status].className
                )}
              >
                {STATUS_LABEL[selectedNode.status].text}
              </span>
            </div>

            <p className="text-xs text-light-gray mb-2">
              {selectedNode.footprintCount} 次打卡紀錄
              {selectedNode.status === "seed" &&
                ` · 再 ${Math.max(0, 3 - selectedNode.footprintCount)} 次即可點亮`}
            </p>

            <div className="flex flex-wrap gap-1 mb-2">
              {selectedNode.level4Subskills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full bg-light-blue text-[10px] font-medium text-logo-cyan"
                >
                  {skill}
                </span>
              ))}
            </div>

            {selectedNode.pinnedFootprint && (
              <p className="text-xs text-text-dark/80 italic border-l-2 border-logo-cyan pl-2 mb-2">
                {selectedNode.pinnedFootprint}
              </p>
            )}

            {selectedNode.reasoningTw && (
              <p className="text-[10px] text-logo-cyan">{selectedNode.reasoningTw}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
