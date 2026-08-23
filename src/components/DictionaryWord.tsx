import { AudioButton } from "@buttons/AudioButton/AudioButton";
import { EditWordButton } from "@buttons/EditWordButton/EditWordButton";
import { SaveWordButton } from "@buttons/SaveWordButton/SaveWordButton";
import { Example } from "@prisma/client";
import { Icon, IconName } from "@ui/Icon";
import { ImageWithShimmer } from "@ui/ImageWithShimmer/ImageWithShimmer";
import clsx from "clsx";
import Link from "next/link";

import { routes } from "@/src/constants/routes";
import { DictionaryWord, Word } from "@/src/types/dictionary";

import { DeleteWordButton } from "../../buttons/DeleteWordButton/DeleteWordButton";
import { DictionaryEntity } from "../DictionaryEntity/DictionaryEntity";
import styles from "./DictionaryWord.module.css";

export interface WordCardProps {
  /**Word to display */
  word: Word;
  /**additional styling */
  className?: string;
  /**short variant does not include word forms, examples and image */
  variant?: "short" | "full";
}

/**Component that displays word */
export const WordCard = ({
  word,
  className,
  // renderButtons,
  variant = "full",
}: WordCardProps) => {
  const {
    name,
    wordCategory,
    audioUrl,
    transcription,
    isOffensive,
    stems,
    imgUrl,
    imgDesc,
    shortDef,
    alternativeSpelling,
    examples,
    id
  } = word;

  const renderAudio = () => {
    if (!audioUrl && !transcription) {
      return null;
    }
    return (
      <section className={styles.audio}>
        {audioUrl && (
          <AudioButton iconHeight={30} iconWidth={30} src={audioUrl} kind="sound" />
        )}
        {transcription && (
          <div className="transcription">[{transcription}]</div>
        )}
      </section>
    );
  };

  const renderExamples = () => {
    if (!examples?.length) {
      return;
    }

    const examplesToShow =
      variant === "short" ? examples.slice(0, 2) : examples;
    const hasMoreExamples = variant === "short" && examples.length > 2;
    const wordId = word.id;

    return (
      <>


        <ul>
          {examplesToShow.map((example: Example) => {
            if (!example?.text) {
              return;
            }
            return (
              <p key={example.text} className={styles.example}>
                <DictionaryEntity text={example.text} />
                {example.translation && ` (${example.translation})`}
              </p>
            );
          })}
        </ul>
        {hasMoreExamples && wordId && (
          <p className={styles.seeMoreLinkContainer}>
            <Link
              href={`${routes.review}/${wordId}`}
              className={styles.seeMoreLink}
            >
              See more examples...
            </Link>
          </p>
        )}
      </>
    );
  };

  const renderShortDefinition = () => {
    const definitionsToShow =
      variant === "short" ? shortDef.slice(0, 3) : shortDef;
    const hasMoreDefinitions = variant === "short" && shortDef.length > 3;
    const wordId = word.id;

    return (
      <ul>
        {definitionsToShow.map((d) => {
          return (
            <li key={d}>
              <p className={styles.definition}>
                <Icon
                  className={styles.defIcon}
                  width={30}
                  height={20}
                  iconId={IconName.book}
                ></Icon>
                <DictionaryEntity text={d} />
              </p>
            </li>
          );
        })}
        {hasMoreDefinitions && wordId && (
          <li>
            <Link
              href={`${routes.review}/${wordId}`}
              className={styles.seeMoreLink}
            >
              See more definitions...
            </Link>
          </li>
        )}
      </ul>
    );
  };

  const renderHeader = () => (
    <header className={styles.header}>
      <div className={styles.mainInfo}>
        {id ? <Link className={styles.link} href={`${routes.review}/${id}`}>
          <h3 className={styles.wordName}>{name}</h3>
        </Link> : <h3 className={styles.wordName}>{name}</h3>}

        <span className={styles.particle}>{wordCategory}</span>
        {renderAudio()}
        {isOffensive && (
          <span className={styles.offensive}>
            <Icon width={20} height={23} iconId={IconName.fire} />
            offensive
          </span>
        )}
      </div>
      {id ? <DeleteWordButton name={word.name} wordId={id} /> : <SaveWordButton word={word as DictionaryWord} />}
    </header>
  );

  return (
    <article className={clsx(className, styles.wordContainer)}>
      {id && <EditWordButton wordId={id} className={styles.editButton} />}
      {renderHeader()}
      <div className={styles.wordContent}>
        <div className={styles.word}>
          {renderShortDefinition()}
          {renderExamples()}
        </div>
        {imgUrl && (
          <figure className={styles.illustration}>
            <div className={styles.pictureContainer}>
              <ImageWithShimmer
                className={styles.picture}
                src={imgUrl}
                alt={`${name} illustration`}
                width={250}
                height={300}
              />
            </div>
            {imgDesc && (
              <figcaption>{<DictionaryEntity text={imgDesc} />}</figcaption>
            )}
          </figure>
        )}
      </div>
      <div>
        {!!stems?.length && variant === "full" && (
          <section>
            <p className={styles.stems}>
              <span className={styles.stemsHeading}>Word forms: </span>
              {stems.join(", ")}
            </p>
          </section>
        )}
        {!!alternativeSpelling?.length && variant === "full" && (
          <section>
            <p className={styles.stems}>
              <span className={styles.stemsHeading}>
                Alternative spelling:{" "}
              </span>
              {alternativeSpelling.join(", ")}
            </p>
          </section>
        )}
      </div>
    </article>
  );
};