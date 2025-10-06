import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { StyledTabContextBox } from './UserTabs.styled';

const UserTabs = ({ panels = [] }) => {
  const [value, setValue] = useState('1');
  return (
    <div className="w-[720px] rounded-lg bg-white max-md:w-full">
      <Tabs value={value} onValueChange={setValue}>
        <StyledTabContextBox>
          <TabsList className="w-full">
            {panels.length > 0 &&
              panels.map((panel) => (
                <TabsTrigger
                  key={panel.id}
                  value={panel.id}
                  className="flex-grow"
                >
                  {panel.title}
                </TabsTrigger>
              ))}
          </TabsList>
        </StyledTabContextBox>
        {panels.length > 0 &&
          panels.map((panel) => (
            <TabsContent key={panel.id} value={panel.id} className="p-0">
              {panel.content}
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
};

export default UserTabs;
