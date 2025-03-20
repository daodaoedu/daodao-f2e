import React from 'react';
import Button from '@/shared/components/Button';

interface AdvancedFiltersProps {
  areaOptions: string[];
  skillOptions: string[];
  selectedAreas: string[];
  selectedSkills: string[];
  onAreaToggle: (area: string) => void;
  onSkillToggle: (skill: string) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  areaOptions,
  skillOptions,
  selectedAreas,
  selectedSkills,
  onAreaToggle,
  onSkillToggle
}) => {
  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 專業領域篩選區 */}
        <div>
          <h3 className="text-sm font-medium mb-2">專業領域</h3>
          <div className="flex flex-wrap gap-1">
            {areaOptions.map((area) => (
              <Button
                key={area}
                onClick={() => onAreaToggle(area)}
                className={`px-3 py-1 m-1 text-sm rounded-full ${
                  selectedAreas.includes(area)
                    ? 'bg-primary-base text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {area}
              </Button>
            ))}
          </div>
        </div>

        {/* 技能篩選區 */}
        <div>
          <h3 className="text-sm font-medium mb-2">技能</h3>
          <div className="flex flex-wrap gap-1">
            {skillOptions.map((skill) => (
              <Button
                key={skill}
                onClick={() => onSkillToggle(skill)}
                className={`px-3 py-1 m-1 text-sm rounded-full ${
                  selectedSkills.includes(skill)
                    ? 'bg-primary-base text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
