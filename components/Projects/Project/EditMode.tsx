import { Project } from '@/components/Projects/Project/type';
import Button from '@/shared/components/Button';
import { Panel } from '@/components/Projects/Project/Shared';
import InputField from '@/components/Projects/Form/InputField';
import MultiSelectDropdown from '@/components/Projects/Form/MultiSelectDropDown';
import { MOTIVATION_MAP, STRATEGY_MAP, OUTCOME_MAP } from '@/constants/project';
import { FaCheck } from "react-icons/fa6";

interface EditModeProps {
  project: Partial<Project>;
  onClickCancel: () => void;
  onClickUpdate: () => void;
  onChangeInput: (
    event:
      React.ChangeEvent<HTMLInputElement> |
      React.ChangeEvent<HTMLTextAreaElement> |
      React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onChangeSelected: (name: string, value: string[]) => void;
  onChangeResourceName: (value: string[]) => void;
}

const EditMode = ({
  project,
  onClickCancel,
  onClickUpdate,
  onChangeInput,
  onChangeSelected,
  onChangeResourceName,
}: EditModeProps) => {
  const handleClickCancel = onClickCancel;
  const handleClickUpdate = onClickUpdate;
  const handleChangeInput = onChangeInput;

  // TODO: squash handleChangeSelected and handleChangeResourceName
  const handleChangeSelected = onChangeSelected;
  const handleChangeResourceName = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { resourceName } = project;
    const { value } = e.target;
    const newResourceName: string[] = resourceName || [];
    newResourceName[index] = value;
    onChangeResourceName(newResourceName);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-4">
      <Panel className="bg-white flex flex-col gap-5">
        <h2 className="text-basic-400 font-sans heading-md">學習計畫</h2>
        <p className="text-basic-400 font-sans text-sm">
          計劃內容在報名截止日前皆可修改。<br />
          入選公告後，所有入選者及報名者亦可持續修改學習計劃
        </p>
        <InputField>
          <InputField.Label htmlFor="title" isRequired>學習計畫標題</InputField.Label>
          <InputField.Input
            id="title"
            name="title"
            value={project?.title}
            onChange={handleChangeInput}
          />
        </InputField>

        <InputField>
          <InputField.Label
            htmlFor="description"
            isRequired
          >
            計畫簡述
          </InputField.Label>
          <InputField.Description>
            請摘要學習計畫。包含你為什麼想做此計畫？你的目標是什麼呢？預計如何達成？
          </InputField.Description>
          <InputField.TextArea
            id="description"
            name="description"
            value={project?.description}
            onChange={handleChangeInput}
          />
        </InputField>

        <InputField>
          <InputField.Label
            htmlFor="motivationDescription"
            isRequired
          >
            學習動機
          </InputField.Label>
          <InputField.Description>
            為什麼會想啟動這個學習計畫？受到哪些經歷、刺激、啟發，包含相關生活、學習等經驗。
          </InputField.Description>
          <MultiSelectDropdown
            placeholder="請選擇學習動機"
            listItems={MOTIVATION_MAP}
            name="motivation"
            onChange={handleChangeSelected}
            selectedItems={project?.motivation || []}
          />
          <InputField.TextArea
            id="motivationDescription"
            name="motivationDescription"
            value={project?.motivationDescription}
            onChange={handleChangeInput}
            placeholder="範例：因為同學常常說我很好笑，很適合把生活日常做成影片，我也發現自己對做影片、當Youtuber有興趣，所以想要嘗試累積作品，並開一個 Youtuber 頻道。"
          />
        </InputField>

        <InputField>
          <InputField.Label
            htmlFor="goal"
            isRequired
          >
            學習目標
          </InputField.Label>
          <InputField.Description>
            你希望學習後獲得什麼收穫？例如知識或技能的習得，又或者態度或習慣的改變。
          </InputField.Description>
          <InputField.TextArea
            id="goal"
            value={project?.goal}
            name="goal"
            onChange={handleChangeInput}
            placeholder="範例：
能收集並分析搞笑風格的 Youtuber
能拍攝畫面穩定、清晰且具專業感的影片"
          />
        </InputField>

        <InputField>
          <InputField.Label
            htmlFor="content"
            isRequired
          >
            學習內容
          </InputField.Label>
          <InputField.Description>
            依據你的學習目標，你具體會學哪些內容呢？例如特定的知識、技能、思維、習慣等。
          </InputField.Description>
          <InputField.TextArea
            id="content"
            name="content"
            onChange={handleChangeInput}
            value={project?.content}
            placeholder="範例：
內容規劃與創意發想（定位、主題、腳本）
基礎拍攝技術（攝影設備、燈光、語音）
影片剪輯與後製（剪輯軟體、配樂）"
          />
        </InputField>

        <InputField>
          <InputField.Label htmlFor="strategyDescription" isRequired>
            學習方法與策略
          </InputField.Label>
          <MultiSelectDropdown
            placeholder="請選擇學習方法與策略"
            listItems={STRATEGY_MAP}
            name="strategy"
            onChange={handleChangeSelected}
            selectedItems={project?.strategy || []}
          />
          <InputField.Description>
            你會如何學習？請先勾選預計的學習方法，並敘述各種學習方法會如何相互搭配。此外，你會如何在過程中使用什麼方式紀錄你的學習呢？例如文字筆記以部落格文章做分享等。
          </InputField.Description>
          <InputField.TextArea
            id="strategyDescription"
            name="strategyDescription"
            value={project?.strategyDescription}
            onChange={handleChangeInput}
            placeholder="範例：
內容規劃與創意發想（定位、主題、腳本）
基礎拍攝技術（攝影設備、燈光、語音）
影片剪輯與後製（剪輯軟體、配樂）"
          />
        </InputField>

        <InputField>
          <InputField.Label
            htmlFor="resources"
            isRequired
          >
            學習資源
          </InputField.Label>
          <InputField.Description>
            你會使用哪些資源呢？包含網路資源的連結、書籍名稱、人／組織、社群、活動／課程、學習工具等，請至少附上名稱與相關連結
          </InputField.Description>
          {
            project?.resourceName?.length && (
              project.resourceName.map((name, index) => {
                const resourceId = `${name}-${Date.now()}-${index}`;
                return (
                  <InputField.Input
                    key={resourceId}
                    id={`resource-${resourceId}`}
                    name={`resource-${resourceId}`}
                    onChange={(e) => handleChangeResourceName(e, index)}
                    value={name}
                    placeholder="範例：YouTube 創作者的實用資源"
                  />
                );
              })
            )
          }
        </InputField>

        <div className="flex flex-row">
          <label htmlFor="isPublic" className="flex flex-row justify-center items-center gap-[5px] hover:cursor-pointer">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              className="peer hidden"
              checked={project?.isPublic}
              onChange={handleChangeInput}
            />
            <p className="
              w-[18px] h-[18px] p-[2px] rounded-[4px] m-[1px]
              flex items-center justify-center
              bg-white text-basic-400 border-2 border-solid border-basic-400
              peer-checked:bg-primary-base
              peer-checked:text-white
                peer-checked:border-primary-base
              "
            >
              <FaCheck />
            </p>
            <p className="text-basic-500">
              公開學習計畫
            </p>
          </label>
        </div>
      </Panel>

      <Panel className="bg-white">
        <InputField>
          <InputField.Label htmlFor="outcomeDescription" isRequired>
            學習成果及呈現方式
          </InputField.Label>
          <MultiSelectDropdown
            placeholder="請選擇學習成果及呈現方式"
            listItems={OUTCOME_MAP}
            name="outcome"
            onChange={handleChangeSelected}
            selectedItems={project?.outcome || []}
          />
          <InputField.Description>
            你最終會用何種方式統整與呈現你所有學習收穫呢？
          </InputField.Description>
          <InputField.TextArea
            id="outcomeDescription"
            name="outcomeDescription"
            value={project?.outcomeDescription}
            onChange={handleChangeInput}
            placeholder="範例：
內容規劃與創意發想（定位、主題、腳本）
基礎拍攝技術（攝影設備、燈光、語音）
影片剪輯與後製（剪輯軟體、配樂）"
          />
        </InputField>
      </Panel>
      <Panel className="
        p-0 md:p-0
        flex flex-col justify-center items-center gap-6
        md:flex-row md:gap-3"
      >
        <Button
          variant="outline"
          onClick={handleClickCancel}
          className="w-[272px] max-w-full"
        >
          取消編輯
        </Button>
        <Button
          variant="solid"
          onClick={handleClickUpdate}
          className="w-[272px] max-w-full"
        >
          發佈修改
        </Button>
      </Panel>
    </div>
  );
};

export default EditMode;
