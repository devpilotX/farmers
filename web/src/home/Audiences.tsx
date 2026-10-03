import { Icon } from "../components/Icon";
export function Audiences() {
  return (
    <section
      className="public-section audience-section"
      id="for-farmers"
      tabIndex={-1}
      aria-labelledby="audience-title"
    >
      <div className="audience-intro">
        <span className="eyebrow">FOR THE PEOPLE ON THE GROUND</span>
        <h2 id="audience-title">
          A farmer should not
          <br />
          have to do it alone.
        </h2>
        <p>
          TerraFort's planned service is assisted by people who know the farmer
          and the village. The current workspace starts with the records those
          people need.
        </p>
        <div className="audience-footnote">
          <Icon name="pin" />
          <span>
            Starting focus: crop farmers in one flood-prone Bihar district. The
            district and partner are not yet confirmed.
          </span>
        </div>
      </div>
      <div className="audience-list">
        <article>
          <span>01</span>
          <div>
            <h3>Farmers and households</h3>
            <p>
              A clear account of the crop, equipment and preparations. The
              intended farmer service is free or institution-sponsored.
            </p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h3>Field workers</h3>
            <p>
              A consistent way to register a farm with permission and keep its
              action checklist and summary together.
            </p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h3>FPOs and local organisations</h3>
            <p>
              A foundation for understanding member farms before coordinating a
              wider preparedness programme.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
