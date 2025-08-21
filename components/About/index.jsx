import React from 'react';
import { Paper } from '@/components/ui/paper';
import AboutUs from './AboutUs';
import RealizeMore from './RealizeMore';
import RelatedReport from './RelatedReport';
import AboutTeam from './AboutTeam';
import AwardInfo from './AwardInfo';
import Thanks from './Thanks';
import NeedYou from './NeedYou';
import ContactUs from './ContactUs';
import TechStack from './TechStack';
import Cooperate from './Cooperate';

const About = () => (
  <div className="pb-10 pt-36">
    <Paper className="mx-auto w-[90%] p-5 max-md:p-2.5">
      <AboutUs />
      <RealizeMore />
      <RelatedReport />
      <AwardInfo />
      <AboutTeam />
      <TechStack />
      <NeedYou />
      <Cooperate />
      <Thanks />
      <ContactUs />
    </Paper>
  </div>
);

export default About;
